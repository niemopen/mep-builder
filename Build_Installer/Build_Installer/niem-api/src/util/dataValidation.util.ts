export const getStringValue = (string, stringType = null) => {
  // if the string is not valid (empty, undefined, or null), choose a value to return in it's place. Otherwise return the string as is. Useful for adding items to the db.
  // stringType: choose whether to return null, '', or some other value. Defaults to null.
  if (string === '' || string === undefined || string === null) {
    return stringType;
  } else {
    return string;
  }
};

export const isStringValid = (string) => {
  if (string === '' || string === undefined || string === null) {
    return false;
  } else {
    return true;
  }
};
