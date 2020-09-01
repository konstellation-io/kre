import os


class Config:
    def __init__(self):
        self.request_timeout = int(os.getenv('KRT_REQUEST_TIMEOUT', 30))

        # Mandatory variables
        try:
            self.krt_version_id = os.environ['KRT_VERSION_ID']
            self.krt_version = os.environ['KRT_VERSION']
            self.krt_node_name = os.environ['KRT_NODE_NAME']
            self.krt_node_id = os.environ['KRT_NODE_ID']
            self.nats_server = os.environ['KRT_NATS_SERVER']
            self.nats_subjects_file = os.environ['KRT_NATS_SUBJECTS_FILE']
            self.influx_uri = os.environ['KRT_INFLUX_URI']
        except Exception as err:
            raise Exception(f"error reading config: the {str(err)} env var is missing")
