const logsController = {};
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

logsController.getLogsByIndex = (req, res, next) => {
  const index = req.query.index;
  const field = req.query.field;
  const value = req.query.value;
  fetch(`http://localhost:9200/${index}/_search?q=${field}:${value}&size=10000`)
    .then((data) => data.json())
    .then((logs) => {
      res.locals.logs = logs;
      return next();
    })
    .catch((error) => {
      console.log(error);
      return next(
        'Error in logsController.getLogsByIndex: Check server logs for more information.'
      );
    });
};

logsController.getEsIndeces = (req, res, next) => {
  fetch('http://localhost:9200/_aliases')
    .then((data) => data.json())
    .then((indices) => {
      res.locals.indices = indices;
      return next();
    })
    .catch((error) => {
      console.log(error);
      return next(
        'Error in logsController.getESIndeces: Check server logs for more information.'
      );
    });
};

logsController.getHourBuckets = (req, res, next) => {
  Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + h * 60 * 60 * 1000);
    return this;
  };
  const startTime = req.query.start;
  const endTime = req.query.end;
  const ranges = [
    {
      from: startTime,
      to: new Date(startTime).addHours(1).toISOString(),
    },
  ];
  while (new Date(ranges[ranges.length - 1].to) < endTime) {
    ranges.push({
      from: ranges[ranges.length - 1].to,
      to: new Date(ranges[ranges.length - 1].to).addHours(1).toISOString(),
    });
  }

  fetch('http://localhost:9200/logstash-*/_search?size=0', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      aggs: {
        range: {
          date_range: {
            field: '@timestamp',
            ranges: ranges,
          },
        },
      },
    }),
  })
    .then((data) => data.json())
    .then((results) => {
      res.locals.hourBuckets = results.aggregations.range.buckets;
      return next();
    })
    .catch((error) => {
      console.log(error);
      return next(
        'Error in logsController.getHourBuckets: Check server logs for more information.'
      );
    });
};

module.exports = logsController;
