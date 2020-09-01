const dataParser = (data) => {
  const parser = new DOMParser();

  const feedData = parser.parseFromString(data, 'text/xml');

  const parsererrors = feedData.querySelector('parsererror');

  if (parsererrors !== null) {
    const error = parsererrors.querySelector('div').textContent;
    throw new Error(error);
  } else {
    const feedTitle = feedData.querySelector('channel title').textContent;
    const items = feedData.querySelectorAll('channel item');

    const posts = [...items].map((singlePost) => {
      const singlePostTitle = singlePost.querySelector('title').textContent;
      const singlePostLink = singlePost.querySelector('link').textContent;
      const singlePostDescription = singlePost.querySelector('description').textContent;
      const singlePostPubDate = singlePost.querySelector('pubDate').textContent;

      const post = {
        title: singlePostTitle,
        link: singlePostLink,
        description: singlePostDescription,
        pubDate: singlePostPubDate,
      };

      return post;
    });
    return { feedTitle, posts };
  }
};

export default dataParser;
