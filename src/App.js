import React, { useState, useEffect } from 'react';
import moment from 'moment';

import './styles/App.css';

const App = () => {
  const [stories, setStories] = useState([]);
  const [authors, setAuthors] = useState({});

  useEffect(() => {
    async function fetchData() {
      const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
      const topStories = await response.json();
      let randomStories = [];
      let randomStory;

      while (randomStories.length < 10) {
        randomStory = topStories[Math.floor(Math.random() * 500)];
        if (!randomStories.includes(randomStory)) {
          randomStories.push(randomStory);
        }
      }

      const storiesInfo = await Promise.all(randomStories.map(async (id) => {
        const result = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        return result.json();
      }));

      const authorsInfo = await Promise.all(storiesInfo.map(async (story) => {
        const author = story.by;
        const result = await fetch(`https://hacker-news.firebaseio.com/v0/user/${author}.json `);
        return result.json();
      }));

      const authorsKarma = authorsInfo.reduce((res, { id, karma }) => {
        return {
          [id]: karma,
          ...res
        };
      }, {});

      const sortedStories = storiesInfo.sort((a, b) => a.score - b.score);

      setStories(sortedStories);
      setAuthors(authorsKarma);
    };

    fetchData();
  }, []);

  return (
    <div className="App">
      <table>
        <thead>
          <tr>
            <th colSpan="2"><h1>10 random Hacker News stories</h1></th>
          </tr>
        </thead>
        <tbody>
          {stories.map((story) => {
            if (!story.url) {
              story.url = 'https://news.ycombinator.com/item?id=' + story.id;
            }

            const date = moment.unix(story.time).format('MMMM Do, YYYY (hh:mm:ss)');

            return (
              <tr key={story.id}>
                <td><img src="news-icon.png" alt="pic" width="30px" /></td>
                <td>
                  <a href={story.url} target="blank">{story.title}</a> <sup>{story.score}</sup><br />
                  <span className="author-info">Posted by <i>{story.by}</i> (Karma: {authors[story.by]}) </span>
                  <span className="author-info">on {date}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div >
  );
}

export default App;
