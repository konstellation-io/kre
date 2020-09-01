from datetime import datetime

from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS


# We are using influxdb-client-python that is compatible with 1.8+ versions:
# https://github.com/influxdata/influxdb-client-python#influxdb-1-8-api-compatibility
INFLUX_ORG = ""  # not used
INFLUX_BUCKET = "kre"  # kre is the created database during the deployment
INFLUX_TOKEN = ""  # we don't need authentication


class KreMeasurements:
    def __init__(self, influx_uri):
        client = InfluxDBClient(url=influx_uri, token=INFLUX_TOKEN)
        self.__write_api__ = client.write_api(write_options=SYNCHRONOUS)

    def save(self, measurement: str, fields: dict, tags: dict):
        point = Point(measurement)

        for key in fields:
            point.field(key, fields[key])

        for key in tags:
            point.tag(key, tags[key])

        point.time(datetime.utcnow(), WritePrecision.NS)

        self.__write_api__.write(INFLUX_BUCKET, INFLUX_ORG, point)
