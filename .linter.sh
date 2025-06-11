#!/bin/bash
cd /home/kavia/workspace/code-generation/clashrealms-108548-788c84e6/clashrealms_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

