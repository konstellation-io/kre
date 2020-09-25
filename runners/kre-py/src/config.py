import os

NATS_FLUSH_TIMEOUT = 10


class Config:
    def __init__(self):
        # Mandatory variables
        try:
            self.krt_version_id = os.environ['KRT_VERSION_ID']
            self.krt_version = os.environ['KRT_VERSION']
            self.krt_node_name = os.environ['KRT_NODE_NAME']
            self.nats_server = os.environ['KRT_NATS_SERVER']
            self.nats_input = os.environ['KRT_NATS_INPUT']
            self.nats_output = os.environ['KRT_NATS_OUTPUT']
            self.nats_mongo_writer = os.environ['KRT_NATS_MONGO_WRITER']
            self.base_path = os.environ['KRT_BASE_PATH']
            self.handler_path = os.environ['KRT_HANDLER_PATH']
            self.mongo_data_db_name = "data"
            self.mongo_uri = os.environ['KRT_MONGO_URI']
            self.influx_uri = os.environ['KRT_INFLUX_URI']
            self.nats_flush_timeout = NATS_FLUSH_TIMEOUT

        except Exception as err:
            raise Exception(f"error reading config: the {str(err)} env var is missing")
