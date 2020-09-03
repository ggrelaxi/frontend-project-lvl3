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
        console.log(state.form.errorsMessages)
        statusBlock.innerHTML = i18next.t(`errors.${state.form.errorsMessages}`);
      }

      if (value === 'download') {
        urlInput.classList.remove('invalid');
        statusBlock.classList.remove('red');
        submitButton.disabled = true;
        const spinner = `<div class="spinner-border text-info" role="status"></div><span class="load-message">${i18next.t('loading')}</span>`;
        statusBlock.innerHTML = spinner;
      }

      if (value === 'download error') {
        submitButton.disabled = false;
        statusBlock.classList.remove('green');
        statusBlock.classList.add('red');
        statusBlock.innerHTML = `${state.form.errorsMessages}`;
      }

      if (value === 'data ready') {
        urlInput.value = '';
        urlInput.classList.remove('invalid');
        statusBlock.classList.remove('red');
        submitButton.disabled = false;
        statusBlock.innerHTML = i18next.t('rssStatus.success');
        statusBlock.classList.add('green');

        const lastAddedFeedNumber = state.feeds.length - 1;
        const { feedId, name: feedName } = state.feeds[lastAddedFeedNumber];
        const feedBlock = document.createElement('div');

        feedBlock.setAttribute('id', feedId);

        const feedTitle = document.createElement('h2');

        feedTitle.innerHTML = feedName;
        feedBlock.append(feedTitle);

        const linksForFeed = state.posts.filter((post) => post.feedId === feedId);

        linksForFeed.forEach((singleLink) => {
          const linkContainer = document.createElement('div');
          const link = document.createElement('a');

          link.setAttribute('href', `${singleLink.link}`);
          link.innerHTML = `${singleLink.title}`;
          linkContainer.append(link);
          feedBlock.append(linkContainer);
        });

        channelsContainer.append(feedBlock);
      }
    }

    if (path === 'posts') {
      submitButton.disabled = false;
      statusBlock.innerHTML = i18next.t('rssStatus.success');
      statusBlock.classList.add('green');

      const lastAddedPostNumber = state.posts.length - 1;
      const lastAddedFeedId = state.posts[lastAddedPostNumber].feedId;
      const feedBlock = document.getElementById(lastAddedFeedId);

      feedBlock.innerHTML = '';

      const feedTitleBlock = document.createElement('h2');

      const lastFeedName = state.feeds
        .filter((feed) => feed.feedId === lastAddedFeedId)
        .map((feed) => feed.name);

      const [feedTitle] = lastFeedName;

      feedTitleBlock.innerHTML = feedTitle;
      feedBlock.append(feedTitleBlock);

      const linkForFeed = state.posts.filter((post) => post.feedId === lastAddedFeedId);

      linkForFeed.forEach((singleLink) => {
        const linkContainer = document.createElement('div');
        const link = document.createElement('a');

        link.setAttribute('href', `${singleLink.link}`);
        link.innerHTML = `${singleLink.title}`;
        linkContainer.append(link);
        feedBlock.append(linkContainer);
      });
    }
  });
  return stateWatcher;
};

export default buildStateWatcher;
