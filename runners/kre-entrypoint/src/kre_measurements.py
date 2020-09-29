from datetime import datetime

from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import WriteOptions, WriteType


# We are using influxdb-client-python that is compatible with 1.8+ versions:
# https://github.com/influxdata/influxdb-client-python#influxdb-1-8-api-compatibility
INFLUX_ORG = ""  # not used
INFLUX_BUCKET = "kre"  # kre is the created database during the deployment
INFLUX_TOKEN = ""  # we don't need authentication


class KreMeasurements:
    def __init__(self, config):
        self.__config__ = config

        client = InfluxDBClient(url=self.__config__.influx_uri, token=INFLUX_TOKEN)
        opts = WriteOptions(write_type=WriteType.batching, batch_size=1_000, flush_interval=500)
        self.__write_api__ = client.write_api(write_options=opts)

    def save(self, measurement: str, fields: dict, tags: dict):
        point = Point(measurement)

        for key in fields:
            point.field(key, fields[key])

        for key in tags:
            point.tag(key, tags[key])

        point.time(datetime.utcnow(), WritePrecision.NS)

        self.__write_api__.write(INFLUX_BUCKET, INFLUX_ORG, point)
