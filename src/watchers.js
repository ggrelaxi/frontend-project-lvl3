import onChange from 'on-change';
import i18next from 'i18next';

const buildStateWatcher = (state) => {
  const stateWatcher = onChange(state, (path, value) => {
    const urlInput = document.querySelector('[name="url"]');
    const statusBlock = document.getElementById('status');
    const submitButton = document.getElementById('add-rss');
    const channelsContainer = document.getElementById('channels');

    if (path === 'form.state') {
      if (value === 'invalid') {
        urlInput.classList.add('invalid');
        statusBlock.classList.add('red');
        statusBlock.innerHTML = `${state.form.errorsMessages}`;
      }
      if (value === 'validation success') {
        urlInput.innerHTML = '';
        urlInput.classList.remove('invalid');
        statusBlock.classList.remove('red');
        statusBlock.innerHTML = '';
      }
      if (value === 'download') {
        submitButton.disabled = true;
        const spinner = `<div class="spinner-border text-info" role="status"></div><span class="load-message">${i18next.t('loading')}</span>`;
        statusBlock.innerHTML = spinner;
      }
      if (value === 'download error') {
        submitButton.disabled = false;
        statusBlock.classList.add('red');
        state.form.loadedChannels.pop();
        statusBlock.innerHTML = `${state.form.errorsMessages}`;
      }
      if (value === 'data ready') {
        submitButton.disabled = false;
        statusBlock.innerHTML = i18next.t('rssStatus.success');
        statusBlock.classList.add('green');

        const lastAddedFeedNumber = state.feeds.length - 1;
        const { feedID, name: feedName } = state.feeds[lastAddedFeedNumber];
        const feedBlock = document.createElement('div');

        feedBlock.setAttribute('id', feedID);

        const feedTitle = document.createElement('h2');

        feedTitle.innerHTML = feedName;
        feedBlock.append(feedTitle);

        const linksForFeed = state.posts.filter((post) => post.feedID === feedID);

        linksForFeed.forEach((singleLink) => {
          const linkContainer = document.createElement('div');
          const link = document.createElement('a');

          link.setAttribute('href', `${singleLink.link}`);
          link.innerHTML = `${singleLink.postTitle}`;
          linkContainer.append(link);
          feedBlock.append(linkContainer);
        });

        channelsContainer.append(feedBlock);
      }
    }
  });
  return stateWatcher;
};

const buildPostsWatcher = (state) => {
  const postsWatcher = onChange(state, (path) => {
    const statusBlock = document.getElementById('status');
    const submitButton = document.getElementById('add-rss');

    if (path === 'posts') {
      submitButton.disabled = false;
      statusBlock.innerHTML = i18next.t('rssStatus.success');
      statusBlock.classList.add('green');

      const lastAddedFeedID = state.posts.length - 1;
      const lastFeedID = state.posts[lastAddedFeedID].feedID;
      const feedBlock = document.getElementById(lastFeedID);

      feedBlock.innerHTML = '';

      const feedTitleBlock = document.createElement('h2');

      const lastFeedName = state.feeds
        .filter((feed) => feed.feedID === lastFeedID)
        .map((feed) => feed.name);

      const [feedTitle] = lastFeedName;

      feedTitleBlock.innerHTML = feedTitle;
      feedBlock.append(feedTitleBlock);

      const linkForFeed = state.posts.filter((post) => post.feedID === lastFeedID);

      linkForFeed.forEach((singleLink) => {
        const linkContainer = document.createElement('div');
        const link = document.createElement('a');

        link.setAttribute('href', `${singleLink.link}`);
        link.innerHTML = `${singleLink.postTitle}`;
        linkContainer.append(link);
        feedBlock.append(linkContainer);
      });
    }
  });
  return postsWatcher;
};

export { buildStateWatcher, buildPostsWatcher };
