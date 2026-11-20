import Tweet from './Tweet';

function LastTweets({
  tweets,
  onDelete,
  onHashtagClick,
  showTitle = true,
}) {
  return (
    <div>
      {showTitle && <h2>Last tweets</h2>}

      {tweets.map((tweet) => (
        <Tweet
          key={tweet._id}
          id={tweet._id}
          content={tweet.content}
          author={tweet.author}
          likes={tweet.likes}
          createdAt={tweet.createdAt}
          onDelete={onDelete}
          onHashtagClick={onHashtagClick}
        />
      ))}
    </div>
  );
}

export default LastTweets;

