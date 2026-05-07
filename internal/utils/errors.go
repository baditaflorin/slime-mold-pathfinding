package utils

import (
	"log"
	"os"
)

func HandleErrorOrLogWithMessages(err error, errMsg, successMsg string) {
	if err != nil {
		log.Printf("%s: %v", errMsg, err)
		os.Exit(1)
	}

	if successMsg != "" {
		log.Print(successMsg)
	}
}
