version: $VERSION 
description: This is the new version that solves some problems.
entrypoint: 
 - proto: public_input.proto
   image: konstellation/kre-golang
   entrypoint: src/input.go

config:
  variables:
    - API_KEY
    - API_SECRET
  files:
    - HTTPS_CERT

nodes:
 - name: ETL
   image: konstellation/kre-python37
   src: src/etl/model_input_etl.py
 
 - name: Execute DL Model
   image: konstellation/kre-pytorch2
   src: src/execute_model/model.py

 - name: Create Output
   image: konstellation/kre-python37
   src: src/output/output.py

 - name: Client Metrics
   image: konstellation/kre-python37
   src: src/client_metrics/client_metrics.py

workflows:
  - name: New prediction
    entrypoint: MakePrediction
    sequential:
      - ETL
      - Execute DL Model
      - Create Output
  - name: Save Client Metrics
    entrypoint: SaveClientMetric
    sequential:
      - Client Metrics

