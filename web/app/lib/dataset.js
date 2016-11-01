class DataSet {
  constructor(aggregate) {
    this.start_time = new Date().getTime()/1000|0;
    // So this is kinda counterintuitive.
    this.total = aggregate.total;
    // Total run time is the delta between start_time and end_time
    let run_time = this.start_time - aggregate.start_time;
    // Tweets per second is pretty simple, then. We'll round down.
    this.tweets_per_second = (aggregate.count / run_time).toFixed(2);
    this.top_emojis = Aggregation.topTen(aggregate.emojis);
    this.top_hashtags = Aggregation.topTen(aggregate.hashtags);    
    this.top_domains = [];
    this.photo_percentage = 0.0;
    this.percentages = [
      { category: "Plaintext", measure: 0 },
      { category: "Emoji", measure: ((aggregate.emoji_count/aggregate.count)*100).toFixed(2); },
      { category: "Image", measure: ((aggregate.url_count/aggregate.count)*100).toFixed(2) },
      { category: "Hashtag", measure: ((aggregate.hashtag_count/aggregate.count)*100).toFixed(2) },
    ],
    this.counts = [
      { category: "Plaintext", measure: 0 },
      { category: "Emoji", measure: 0 },
      { category: "URL", measure: 0 },
      { category: "Image", measure: 0 },
      { category: "Hashtag", measure: 0 },
    ]
  };
};