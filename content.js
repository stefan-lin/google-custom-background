/*
  Google Search Page Custom Background - Google Chrome Extension

  Author: Stefan Lin
  Version: 0.0.1
  Date: Aug/5/2017
  ----------------------------------------------------------------------
  The extension will randomly download high-definition images from
  Unsplash.com.
*/

/*
  Function Name: set_default_size_to_local_storage
  Parameters:    resolution(json){width(int), height(int)}
  Return:        boolean

  Put the client's screen resolution info into local persistent storage.
  It will return a boolean value indicate the status of operation.
*/
// Global Variables
//var google_viewport, google_body, google_footer, google_fbar;
var google_eles;
var delta = 500;
var lastKeypressTime = 0;
var flag = true;

function set_default_size_to_local_storage(resolution){
  if(!resolution || !resolution['width'] || !resolution['height']){
    console.log(
      '[Error] resolution is Null in set_default_size_to_local_storage'
    );
    return;
  }
  if(resolution && resolution['width'] && resolution['height']){
    chrome.storage.sync.set({
      'resolution': { resolution }
    }, function(){
      console.log('Default resolution size set');
      return true;
    });
  }
}

/*
  Function Name: read_defaults_from_storage
  Parameters:    None
  Return:        json object { 'width': , 'height': }

  Read client's screen resolution from the persistent storage
*/
function read_defaults_from_storage(){
  chrome.storage.sync.get('resolution', function(resolution){
    console.log(resolution['width']);
    // do something about resolution
  });
}

/*
  Function Name: inject_image_into_background
  Parameters:    image_url(str)
  Return:        None

  Put image into background
*/
function inject_image_into_background(image_url){
  var style_sheet = document.createElement('style');
  style_sheet.innerHTML = "body#gsr.hp.vasq{background-image: url(" + 
    image_url + ");}";
  document.body.appendChild(style_sheet);
}

/*
  Function Name: inject_unsplash_info_links
  Parameters:    author_name(str), author_home(str)
  Return:        None

  Append UTM info to links.
*/
function inject_unsplash_info_links(author_name, author_home){
  var unsplash_div  = document.createElement('div');
  var author_link   = document.createElement('a');
  var unsplash_link = document.createElement('a');
  var span_ele      = document.createElement('span');

  unsplash_div.setAttribute('id', 'floating-container');

  author_link.setAttribute('class', 'unsplash-link-class');
  author_link.setAttribute('href', author_home + '?utm_source=Google Page Custom Background&utm_medium=referral&utm_campaign=api-credit');
  author_link.setAttribute('target', '_blank');
  author_link.innerHTML = author_name;

  unsplash_link.setAttribute('class', 'unsplash-link-class');
  unsplash_link.setAttribute('href', 'https://unsplash.com/?utm_source=Google Page Custom Background&utm_medium=referral&utm_campaign=api-credit');
  unsplash_link.setAttribute('target', '_blank');
  unsplash_link.innerHTML = 'Unsplash';

  span_ele.setAttribute('class', 'unsplash-link-class');
  span_ele.innerHTML = ' / ';

  unsplash_div.appendChild(author_link);
  unsplash_div.appendChild(span_ele);
  unsplash_div.appendChild(unsplash_link);

  document.body.appendChild(unsplash_div);
}

/*
  Function Name: read_dom
  Parameters:    None
  Return:        None

  Load target DOM elements into global array.
  IDs were given by Google.
*/
function read_dom(){
  google_eles = [
    document.getElementById('viewport'),
    document.getElementById('body'),
    document.getElementById('footer'),
    document.getElementById('fbar')
  ];
}

/*
  Function Name: query_random_image_from_unsplash
  Parameters:    None
  Return:        URL

  Make a GET API call to UnSplash with or without specific category. If
  call is successful, return URL. Otherwise, do nothing.(TODO: return
  a URL path to a local default image if fail to download)
*/
function query_random_image_from_unsplash(){
  read_dom();

  fetch('https://api.unsplash.com/photos/random/?client_id=632c1d73955fbf286b85e73d858e8f82a583655b90426b2d914810912474a180&w=1920&h=1080')
    .then((response) => response.json())
    .then(function(response_json){
      inject_image_into_background(response_json.urls.custom)
      inject_unsplash_info_links(
        response_json.user.name, 
        response_json.user.links.html
      );
    })
    .catch(function(error){
      console.log(error);
    });
}

/*
  Function Name: double_keypress
  Parameters:    None
  Return:        None

  Bring background image to the front, vice versa
*/
function double_keypress(){
  for(i=0; i<google_eles.length; i++){
    if(flag){
      google_eles[i].classList.add('hidden-class');
    }
    else{
      google_eles[i].classList.remove('hidden-class');
    }
  } // end for loop
  flag = (flag)? false: true;
}

window.onload = query_random_image_from_unsplash();
window.onkeydown = function (event){
  if(event.shiftKey){
    var thisKeypressTime = new Date();
    if(thisKeypressTime - lastKeypressTime <= delta){
      double_keypress();
      thisKeypressTime = 0;
    }
    lastKeypressTime = thisKeypressTime;
  }
}