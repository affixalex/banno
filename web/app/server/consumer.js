"use strict";

const Twitter   = require('twitter');
const re        = require('rethinkdbdash')({
                    pool: false,
                    cursor: true
                  });

const TweetReport = require("../lib/tweet_report.js");

// RethinkDB connection info.
const RDB_HOST = "meek" || process.env.RDB_HOST;
const RDB_PORT = 28015 || process.env.RDB_PORT;
// Twitter credentials. Not used at the moment.
const CONSUMER_KEY        = process.env.CONSUMER_KEY;
const CONSUMER_SECRET     = process.env.CONSUMER_SECRET;
const ACCESS_TOKEN_KEY    = process.env.ACCESS_TOKEN_KEY;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

re.connect({host: RDB_HOST, port: RDB_PORT}).then(function(dbconn) {
  // Rather than doing database migrations, this is a neat approach.
  re.dbList().contains('tweetstream')
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
  );

  re.db('tweetstream')
    .tableList()
    .contains("tweets")
    .do(function(containsTable) {
      return re.branch(
 		    containsTable,
 			  {created: 0},
 			  re.db('tweetstream').tableCreate('tweets')
      );
 	  })
    .run(dbconn, function(err) {
      if (err) {
        console.log("Error: " + err);
        process.exit(1);
      } else {
        console.log("tweetstream.tweets table ready.");
      }
    }
  );
  
  const twitter_client = new Twitter({
    consumer_key: 'CZiH9nNdZusUh2NZSIehGvCx5',
    consumer_secret: 'D6TJQECyRpgOCPXTKgkACPrZOJn55hcRSTWHZ7ivUwMmjt8cUQ',
    access_token_key: '73754977-YkRb0LtskSUBSxIaYDQ5m0GnTgzW9SIXRHZXikkoH',
    access_token_secret: 'pLqREFzqZDWkhUUZl3ZtpD09Xcptaln8CMaAXSuLTaOgv'
  });
  
  twitter_client.stream('statuses/sample', function(stream) {

    stream.on('data', function(tweet) {
      // A TweetReport is an aggregation of an individual tweet.
      let this_tweet = new TweetReport(tweet);
      console.log("Persisting tweet:\n" + JSON.stringify(this_tweet));
      re.db('tweetstream').table('tweets').insert(this_tweet)
        .run(dbconn, function(err) {
      		if(err) {
      			console.log("Error: " + err);
      			process.exit(1);
      		}
      });
    });

    stream.on('error', function(error) {
      throw error; // We could probably try to be more graceful here.
    });
    
  });

  
});
