version: $VERSION 
description: This is the new version that solves some problems.
entrypoint: 
  proto: public_input.proto
  image: konstellation/kre-runtime-entrypoint:latest
  src: src/input.go

config:
  variables:
    - API_KEY
    - API_SECRET
  files:
    - HTTPS_CERT

nodes:
 - name: ETL
   image: alpine:latest
   src: src/etl/model_input_etl.py

 - name: Model
   image: alpine:latest
   src: src/execute_model/model.py

workflows:
  - name: New prediction
    entrypoint: MakePrediction
    sequential:
      - ETL
      - Model

