const { parse, AST } = require('json-ast');

const $paste = document.getElementById('paste');
const $result = document.getElementById('json');
const $instructions = document.getElementById('instructions');
const $error = document.getElementById('error');

const ERROR_SYMBOL = Symbol();
const MAX_STORAGE_COUNT = 10;

function formatJSON(json_string) {
  try {
    const ast = parse(json_string, { junker: true });
    const parsed = AST.JsonNode.toJSON(ast);
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    return ERROR_SYMBOL;
  }
}

$paste.onpaste = (event) => {
  let raw_paste;

  if (window.clipboardData && window.clipboardData.getData) {
    raw_paste = window.clipboardData.getData('Text');
  } else if (event.clipboardData && event.clipboardData.getData) {
    raw_paste = event.clipboardData.getData('text/plain');
  }

  const result = formatJSON(raw_paste);

  if (result === ERROR_SYMBOL) {
    $result.style.display = 'none';
    $instructions.style.display = 'none';
    $error.style.display = 'block';
  } else {
    const hash = Date.now();
    window.localStorage.setItem(hash, result);
    window.location.hash = hash;

    // Delete the oldest key after we get more than `MAX_STORAGE_COUNT`
    if (window.localStorage.length > MAX_STORAGE_COUNT) {
      const keys = Object.keys(window.localStorage).sort();
      const key = keys[0];
      window.localStorage.removeItem(key);
    }
  }

  return false; // prevent default
};

// Attempt to find the JSON object in storage by the url hash
window.onhashchange = (event) => {
  const hash = event.target.location.hash;
  if (hash) {
    const result = window.localStorage.getItem(hash.substring(1));
    if (result) {
      $result.style.display = 'block';
      $result.innerHTML = result;
      $instructions.style.display = 'none';
      $error.style.display = 'none';
      return true;
    }
  }

  $result.style.display = 'none';
  $result.innerHTML = '';
  $instructions.style.display = 'block';
  $error.style.display = 'none';
  return true;
};
