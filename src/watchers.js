import onChange from 'on-change';
import i18next from 'i18next';

const buildStateWatcher = (state) => {
  const stateWatcher = onChange(state, (path, value) => {
    const urlInput = document.querySelector('[name="url"]');
    const statusBlock = document.getElementById('status');
    const submitButton = document.getElementById('add-rss');
    const channelsContainer = document.getElementById('channels');

    if (path === 'form.state') {
      switch (value) {
        case 'invalid': {
          urlInput.classList.add('border', 'border-danger');
          statusBlock.classList.add('text-danger');
          statusBlock.innerHTML = i18next.t(`errors.${state.form.errorsMessages}`);
          break;
        }

        case 'valid': {
          urlInput.classList.remove('text-danger');
          statusBlock.classList.remove('border', 'border-danger');
          break;
        }

        default:
          throw new Error(`invalid value: ${value}`);
      }
    }

    if (path === 'feedLoader.state') {
      switch (value) {
        case 'loading': {
          submitButton.disabled = true;
          const spinner = `<div class="spinner-border text-info" role="status"></div><span class="load-message text-primary ml-3">${i18next.t('loading')}</span>`;
          statusBlock.innerHTML = spinner;
          break;
        }

        case 'loaded': {
          urlInput.value = '';
          urlInput.classList.remove('border', 'border-danger');
          statusBlock.classList.remove('text-danger');
          submitButton.disabled = false;
          statusBlock.innerHTML = i18next.t('rssStatus.success');
          statusBlock.classList.add('text-success');

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
          break;
        }

        case 'error': {
          submitButton.disabled = false;
          statusBlock.classList.remove('text-success');
          statusBlock.classList.add('text-danger');
          statusBlock.innerHTML = i18next.t(`errors.${state.feedLoader.errorsMessages}`);
          break;
        }

        default:
          throw new Error(`Incorrect value: ${value}`);
      }
    }

    if (path === 'posts') {
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
