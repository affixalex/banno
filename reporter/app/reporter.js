"use strict";

const re               = require("rethinkdbdash");
const Twitter          = require("twitter");
const TweetAggregation = require("./lib/tweet_aggregation.js");
const TweetConsumer    = require("./lib/tweet_consumer.js");
const TweetReport      = require("./lib/tweet_report.js");

const RDB_HOST = process.env.RDB_HOST || "rethinkdb";
const RDB_PORT = process.env.RDB_PORT || 28015

const twitter_client = new Twitter({
  consumer_key: 'CZiH9nNdZusUh2NZSIehGvCx5',
  consumer_secret: 'D6TJQECyRpgOCPXTKgkACPrZOJn55hcRSTWHZ7ivUwMmjt8cUQ',
  access_token_key: '73754977-YkRb0LtskSUBSxIaYDQ5m0GnTgzW9SIXRHZXikkoH',
  access_token_secret: 'pLqREFzqZDWkhUUZl3ZtpD09Xcptaln8CMaAXSuLTaOgv'
});

var aggregate    = new TweetAggregation();
const consumer   = new TweetConsumer(aggregate);

re.connect({host: RDB_HOST, port: 28015}).then(function(dbconn) {
  // Rather than doing database migrations, this is a neat approach.
  re.dbList()
    .contains('tweetstream')
    .do(function(containsDB) {
      return re.branch(
 	      containsDB,
 		    {created: 0},
 		    re.dbCreate('tweetstream')
 	    );
    })
    .run(dbconn, function(err) {
      if (err) {
        console.log("Error: " + err);
        process.exit(1);
      } else {
        console.log("tweetstream database ready.");
      }
    }
  )
  .then(function() {
    re.db('tweetstream')
      .tableList()
      .contains("reports")
      .do(function(containsTable) {
        return re.branch(
	        containsTable,
		      {created: 0},
		      re.db('tweetstream').tableCreate('reports')
        );
      })
      .run(dbconn, function(err) {
        if (err) {
          console.log("Error: " + err);
          process.exit(1);
        } else {
          console.log("tweetstream.reports table ready.");
        }
      }
    ).then(function(cursor) {
      // Now we can kick off the feed!
      /* 
      re.db("tweetstream")
        .table("reports")
        .indexCreate("timestamp")
        .run(dbconn);
      */

      twitter_client.stream('statuses/sample', function(stream) {
        stream.on('data', function(tweet) {
          consumer.eat(tweet);
        });
        
        stream.on('error', function(error) {
          console.log(error);
          process.exit(1);
        });
      });
    });
  });
});

setInterval(
  function() {
    let this_report = new TweetReport(aggregate).json();
    re.db('tweetstream').table('reports').insert(this_report)
      .run(dbconn, function(err) {
    		if(err) {
    			console.log("Error: " + err);
    			process.exit(1);
    		}
      })
      .then(function() {
        // Create a new aggregation each time we flush to DB.
        var aggregate    = new TweetAggregation();
        const consumer   = new TweetConsumer(aggregate);
      });
  },
  5000
);
