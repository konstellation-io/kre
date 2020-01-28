#!/bin/bash

sh -c "python $KRT_ENTRYPOINT 2>&1 | tee -a /var/log/app/app.log"
