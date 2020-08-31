const dataParser = (data) => {
  const parser = new DOMParser();

  const feedData = parser.parseFromString(data, 'text/xml');
  const feedTitle = feedData.querySelector('channel title').textContent;
  const items = feedData.querySelectorAll('channel item');
  const posts = [];

  [...items].forEach((singlePost) => {
    const singlePostTitle = singlePost.querySelector('title').textContent;
    const singlePostLink = singlePost.querySelector('link').textContent;

    posts.push({
      feedTitle,
      postTitle: singlePostTitle,
      link: singlePostLink,
    });
  });
  // .catch((error) => {
  //   watchedState.form.errorsMessages = error;
  //   watchedState.form.state = 'download error';
  //   throw new Error(error);
  // })
  // .finally(() => {
  //   checkUpdate(correctUrl, feedID);
  // });
  return [{ feedTitle }, posts];
};

export default dataParser;
