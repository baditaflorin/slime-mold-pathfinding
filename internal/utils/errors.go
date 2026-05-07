// Package utils contains shared command-line utility conventions.
package utils

import (
	"log"
	"os"
)

// HandleErrorOrLogWithMessages exits on errors and logs optional success text.
func HandleErrorOrLogWithMessages(err error, errMsg, successMsg string) {
	if err != nil {
		log.Printf("%s: %v", errMsg, err)
		os.Exit(1)
	}

	if successMsg != "" {
		log.Print(successMsg)
	}
}
