function Trends({ trends, onHashtagClick }) {
  return (
    <div>
      <h2>Trends</h2>

      {trends.map((trend) => (
        <div
          key={trend.hashtag}
          onClick={() => onHashtagClick(trend.hashtag)}
          style={{ cursor: 'pointer', marginBottom: '20px' }}
        >
          <strong>{trend.hashtag}</strong>
          <p>{trend.count} tweets</p>
        </div>
      ))}
    </div>
  );
}

export default Trends;