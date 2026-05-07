export class WebGpuDiffuser {
  private constructor(
    private readonly device: GPUDevice,
    private readonly pipeline: GPUComputePipeline,
    private readonly bindGroupLayout: GPUBindGroupLayout,
    private readonly width: number,
    private readonly height: number,
  ) {}

  static async create(width: number, height: number): Promise<WebGpuDiffuser> {
    if (!navigator.gpu) {
      throw new Error("WebGPU is not available");
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error("No WebGPU adapter is available");
    }

    const device = await adapter.requestDevice();
    const bindGroupLayout = device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: "read-only-storage" },
        },
        {
          binding: 1,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: "storage" },
        },
        {
          binding: 2,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: "uniform" },
        },
      ],
    });

    const pipeline = device.createComputePipeline({
      layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
      compute: {
        module: device.createShaderModule({ code: diffuseShader }),
        entryPoint: "main",
      },
    });

    return new WebGpuDiffuser(device, pipeline, bindGroupLayout, width, height);
  }

  async diffuse(input: Float32Array, decay = 0.965, diffusion = 0.24) {
    const byteLength = input.byteLength;
    const inputBuffer = this.device.createBuffer({
      size: byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    const outputBuffer = this.device.createBuffer({
      size: byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
    });
    const readBuffer = this.device.createBuffer({
      size: byteLength,
      usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
    });
    const paramsBuffer = this.device.createBuffer({
      size: 32,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const params = new ArrayBuffer(32);
    const uintParams = new Uint32Array(params, 0, 4);
    uintParams[0] = this.width;
    uintParams[1] = this.height;
    const floatParams = new Float32Array(params, 16, 4);
    floatParams[0] = decay;
    floatParams[1] = diffusion;

    this.device.queue.writeBuffer(inputBuffer, 0, input);
    this.device.queue.writeBuffer(paramsBuffer, 0, params);

    const bindGroup = this.device.createBindGroup({
      layout: this.bindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: inputBuffer } },
        { binding: 1, resource: { buffer: outputBuffer } },
        { binding: 2, resource: { buffer: paramsBuffer } },
      ],
    });

    const encoder = this.device.createCommandEncoder();
    const pass = encoder.beginComputePass();
    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.dispatchWorkgroups(Math.ceil(this.width / 8), Math.ceil(this.height / 8));
    pass.end();
    encoder.copyBufferToBuffer(outputBuffer, 0, readBuffer, 0, byteLength);
    this.device.queue.submit([encoder.finish()]);

    await readBuffer.mapAsync(GPUMapMode.READ);
    const mapped = readBuffer.getMappedRange();
    const output = new Float32Array(mapped.slice(0));
    readBuffer.unmap();

    inputBuffer.destroy();
    outputBuffer.destroy();
    paramsBuffer.destroy();
    readBuffer.destroy();

    return output;
  }
}

const diffuseShader = /* wgsl */ `
struct Params {
  width: u32,
  height: u32,
  _pad0: u32,
  _pad1: u32,
  decay: f32,
  diffusion: f32,
  _pad2: f32,
  _pad3: f32,
}

@group(0) @binding(0) var<storage, read> inputField: array<f32>;
@group(0) @binding(1) var<storage, read_write> outputField: array<f32>;
@group(0) @binding(2) var<uniform> params: Params;

fn readCell(x: i32, y: i32) -> f32 {
  let clampedX = clamp(x, 0, i32(params.width) - 1);
  let clampedY = clamp(y, 0, i32(params.height) - 1);
  let index = u32(clampedY) * params.width + u32(clampedX);
  return inputField[index];
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  if (id.x >= params.width || id.y >= params.height) {
    return;
  }

  let x = i32(id.x);
  let y = i32(id.y);
  let index = id.y * params.width + id.x;
  let center = readCell(x, y);
  let neighborAverage = (
    readCell(x - 1, y) +
    readCell(x + 1, y) +
    readCell(x, y - 1) +
    readCell(x, y + 1)
  ) * 0.25;
  outputField[index] = clamp(
    (center * (1.0 - params.diffusion) + neighborAverage * params.diffusion) * params.decay,
    0.0,
    1.0,
  );
}
`;
