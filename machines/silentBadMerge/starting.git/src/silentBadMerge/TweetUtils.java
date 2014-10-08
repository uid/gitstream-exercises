package silentBadMerge;

import java.time.Instant;
import java.util.List;

public class TweetUtils {
    /**
     * Find a tweet at the specified instant.
     * @param tweets the list of tweets to search
     * @param time the timestamp for which to search
     * @throws TweetNotFoundException if the tweet is not found
     * @return a tweet occuring at the specified instant
     */
    public static Tweet findTweetAt(List<Tweet> tweets, Instant time) throws TweetNotFoundException {
        for(Tweet tweet : tweets) {
            if(tweet.getTimestamp().equals(time)) {
                return tweet;
            }
        }
        throw new TweetNotFoundException();
    }
    
    public static class TweetNotFoundException extends Exception {
        private static final long serialVersionUID = 1L;
    }
}
