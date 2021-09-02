import React from 'react';
import { useState, useEffect } from 'react';
import moment from 'moment';

import './styles/App.css';

const App = () => {
  const [stories, setStories] = useState([]);
  const [authors, setAuthors] = useState({});

  useEffect(() => {
    async function fetchData() {
      const url = 'https://hacker-news.firebaseio.com/v0/topstories.json';
      const response = await fetch(url);
      const topStories = await response.json();

      let randomStories = [];
      let randomStory;

      while (randomStories.length < 10) {
        randomStory = topStories[Math.floor(Math.random() * 500)];
        if (!randomStories.includes(randomStory)) {
          randomStories.push(randomStory);
        }
      }

      const storyInfo = await Promise.all(randomStories
        .map(async (id) => {
          const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
          return res.json();
        }));

      const authorsInfo = await Promise.all(storyInfo
        .map(async (story) => {
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

      const sortedStories = storyInfo.sort(function (a, b) {
        return a.score - b.score;
      });

      setStories(sortedStories);
      setAuthors(authorsKarma);
    };

    fetchData();
  }, []);

  return (
    <div className="App">
      <h1>10 random Hacker News stories</h1>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Title</th>
            <th>Rating</th>
            <th>Dated</th>
          </tr>
        </thead>
        <tbody>
          {stories.map((story, ind) => {
            if (!story.url) {
              story.url = 'https://news.ycombinator.com/item?id=' + story.id;
            }

            const date = moment.unix(story.time).format('MMMM Do YYYY, hh:mm:ss');

            return (
              <React.Fragment key={ind}>
                <tr>
                  <td rowSpan="2"><img src="news-icon.png" alt="pic" width="30px" /></td>
                  <td><a href={story.url} target="blank">{story.title}</a></td>
                  <td>{story.score}</td>
                  <td>{date}</td>
                </tr>
                <tr key={ind}>
                  <td>by: {story.by} (Karma: {authors[story.by]})</td>
                  <td></td>
                  <td></td>
                </tr>
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div >
  );
}

export default App;
