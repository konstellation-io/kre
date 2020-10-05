import json
from datetime import datetime

from nats.aio.client import ErrTimeout


class ContextPrediction:
    ERR_MISSING_VALUES = "missing_values"
    ERR_NEW_LABELS = "new_labels"

    def __init__(self, config, nc, logger):
        self.PREDICTION_ERRORS = [self.ERR_MISSING_VALUES, self.ERR_NEW_LABELS]
        self.__config__ = config
        self.__nc__ = nc
        self.__logger__ = logger

    async def save(self, predicted_value: str = "", true_value: str = "", utcdate: datetime = None,
                   error: str = "") -> None:
        if error != "":
            if error not in self.PREDICTION_ERRORS:
                raise Exception(f"[ctx.prediction.save] invalid value for metric error {error} "
                                f"should be one of '{','.join(self.PREDICTION_ERRORS)}'")
        else:
            if not isinstance(predicted_value, str) or predicted_value == "":
                raise Exception(f"[ctx.prediction.save] invalid 'predicted_value'='{predicted_value}',"
                                f" must be a nonempty string")
            if not isinstance(true_value, str) or true_value == "":
                raise Exception(f"[ctx.prediction.save] invalid 'true_value'='{true_value}', must be a nonempty string")

        if utcdate is None:
            utcdate = datetime.utcnow()

        coll = "classificationMetrics"
        doc = {
            "date": utcdate_to_rfc3339(utcdate),
            "error": error,
            "predictedValue": predicted_value,
            "trueValue": true_value,
            "versionId": self.__config__.krt_version_id,
            "versionName": self.__config__.krt_version
        }

        try:
            subject = self.__config__.nats_mongo_writer
            payload = bytes(json.dumps({"coll": coll, "doc": doc}), encoding='utf-8')
            response = await self.__nc__.request(subject, payload, timeout=1)
            res_json = json.loads(response.data.decode())
            if not res_json['success']:
                self.__logger__.error("Unexpected error saving metric")
        except ErrTimeout:
            self.__logger__.error("Error saving metric: request timed out")


def utcdate_to_rfc3339(utcdate):
    offset = utcdate.utcoffset()
    if offset and offset.total_seconds() != 0:
        raise Exception("Input date must be a UTC datetime")

    return utcdate.strftime('%Y-%m-%dT%H:%M:%S.%fZ')
