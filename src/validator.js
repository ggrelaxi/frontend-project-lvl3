import * as yup from 'yup';

const schema = yup.string().url().required();

export default (channels, rssLink) => {
  try {
    schema.notOneOf(channels).validateSync(rssLink);
    return null;
  } catch (validationError) {
    return validationError;
  }
};

// и вызвать ее validation(channel), с подготовленным массивом каналов?
