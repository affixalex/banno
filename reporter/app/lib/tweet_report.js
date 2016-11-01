"use strict";

const Aggregation = require("./tweet_aggregation.js");

class TweetReport {
  constructor(aggregate) {
    this.aggregate = aggregate;
  }
  
  json() {
    if ( this.aggregate.count == 0 ) {
      return null;
    } else {
      this.aggregate.end = new Date(); 
      return JSON.stringify(this.aggregate); 
    }
  }
}

module.exports = TweetReport;