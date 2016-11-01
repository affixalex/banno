"use strict";

var Sample = require("./sample.js");

class Aggregation {
  constructor() {
    // To be more accurate here, we could only consider it a start after 
    // receiving our first tweet. It's pretty statistically insignificant.
    this.start_time = new Date().getTime()/1000|0; // Start time in UNIX format
    this.total = 0; // The total number of tweets.
    // The commented out lines are just to demonstrate the eventual structure.
    this.dataset = {
      // { group: "emoji", category: "", measure: 0 },
      // { group: "url", category: "", measure: 0 },
      // { group: "image", category: "", measure: 0 },
      // { group: "hashtag", category: "", measure: 0 },
    };
    this.counts = {
      { category: "plaintext", measure: 0 },
      { category: "emoji", measure: 0 },
      { category: "url", measure: 0 },
      { category: "image", measure: 0 },
      { category: "hashtag", measure: 0 }
    };
  };

  _consume(tweet) { // The underscore is a Python convention, but eh.
    // If the tweet contains any entities...
    if (tweet.entities != null) {
      // If the tweet contains hashtags, aggregate them.
      if (tweet.entities.hashtags.length > 0) {
        // increment the total hashtag count
        this.counts.category['hashtag'].measure++; 
        for (var i = 0; i < tweet.entities.hashtags.length; i++) {
          var key = tweet.entities.hashtags[i].text;
          if ( this.dataset.group['hashtag'].category[key] != null ) {
            this.dataset
                .group['hashtag']
                .category[key]++; // increment the count for this hashtag
          } else {
            this.dataset
                .group['hashtag']
                .category[key] = 1; // or set it to 1, if it doesn't exist
          };
        };
      };    
      // If the tweet contains URLs, aggregate them.
      if (tweet.entities.urls.length > 0) {
        this.url_count++; // increment the total URL count
        for (let i = 0; i < tweet.entities.urls.length; i++) {
          let key = tweet.entities.urls[i].display_url;
          /*
          if ( URL.parse(key).hostname == "pics.twitter.com" ||  ) {
            
          } else if ( ) {
            
          } else if ( ) {
            
          } */
          if ( key in this.urls ) {
            this.urls[key]++; //increment the count for this url
          } else {
            this.urls[key] = 1; // or add it, if it doesn't exist
          };
        };
      };
      // Even if the tweet doesn't contain any entities, it may have emojis.
      var matches = tweet.text.match(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g);
      if (matches) { 
        this.emoji_count++; // Noticing a pattern here? :)
        for (let match of matches) {
          if (match in this.emojis) {
            this.emojis[match]++;
          } else {
            this.emojis[match] = 1;
          }
        }
      };
    };
  };
  
  consume(tweet) {
    // This is a gratuitously long condition but, eh.
    if (tweet.retweeted_status != null && tweet.retweeted_status.length > 0) {
      this._consume(tweet.retweeted_status);
    } else {
      this._consume(tweet);
    };
    this.count++; // Finally, increment the count for this aggregation.
  };
  
  static topTen(obj) {
    var tuples = [];
    for (let key in obj) {
      tuples.push([key, obj[key]]);
    }
    tuples.sort(function(a, b) { return a[1] < b[1] ? 1 : a[1] > b[1] ? -1 : 0 });
    return tuples.slice(0, 9);
  }
};

module.exports = Aggregation;