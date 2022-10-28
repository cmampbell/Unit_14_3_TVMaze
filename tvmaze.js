"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(q) {
  const res = await axios.get('https://api.tvmaze.com/search/shows', {params: {q}}); // Make get request of TV Maze API
  let url; //declare url variable for later
  const showArr = []; //create empty array for results
  for (let entry of res.data){
    const {name, id, summary, image} = entry.show //create variables from API data
    if (image){
      url = image.medium; // if there is an image, set url equal the medium size
    } else {url = 'https://tinyurl.com/tv-missing'} //default image if there is no medium image

    showArr.push({name, id, summary, url}); //push an object to an array for each show
  }
  return showArr; //return array
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $showElem = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.url}" 
              alt="Bletchly Circle San Francisco" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-primary btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($showElem);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  if (term){
    const shows = await getShowsByTerm(term);
    $episodesArea.hide();
    populateShows(shows);
  }
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const res = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);
  let episodeArr = [];
  for (let entry of res.data){
    const {name, id, season, number} = entry
    episodeArr.push({name, id, season, number});
 }
 return episodeArr;
}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes) {
  $('#episodes-area').attr('style', "display: block");
  const episodeList = $('#episodes-list').empty();
  for(let episode of episodes){
    $(`<li>${episode.name} (season ${episode.season}, number ${episode.number})</li>`).appendTo(episodeList);
  }
 }

 $showsList.click( async function(evt) {
  if(evt.target.nodeName === 'BUTTON'){
    let showId = $(evt.target).closest('.Show').data('showId');
    const episodes = await getEpisodesOfShow(showId);
    populateEpisodes(episodes);
  }
 })