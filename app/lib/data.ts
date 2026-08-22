/* =======================================================================
   DATA — edit here. status: store | site | unknown | none
   ======================================================================= */

export type Band = {
  /** name shown on the site */
  n: string;
  /** "store" if they sell online, "none" if they don't */
  s: "store" | "site" | "unknown" | "none";
  /** where they're from */
  base: string;
  /** the blurb on their card */
  kind: string;
  /** their main link */
  u?: string;
  /** label for the main link (defaults to "Buy") */
  l1?: string;
  /** an optional second link */
  u2?: string;
  /** label for the second link (defaults to "More") */
  l2?: string;
};

export type Day = {
  label: string;
  date: string;
  /** 24-hour "HH:MM" — when the first band starts */
  start: string;
  /** one list of band names per stage, in playing order */
  lanes: string[][];
};

export const BANDS: Band[] = [
 {n:"La Armada",           s:"store", base:"Chicago, IL",       kind:"Latino hardcore fury, formed in Santo Domingo and based in Chicago since 2008. Has toured with Sick of It All and Propagandhi.", u:"https://www.merchbar.com/rock-alternative/la-armada"},
 {n:"Take the Reins",      s:"store", base:"Chicago, IL",       kind:"Chicago rock fronted by Courtney Boyers, on Flat Aht Records. Compared to Joan Jett by way of the Pretenders.",       u:"https://takethereins.bandcamp.com/merch", u2:"https://linktr.ee/takethereins", l2:"Links"},
 {n:"The Horrids",         s:"unknown", base:"—",               kind:""},
 {n:"Steve's in the Band", s:"store", base:"West Chicago, IL",  kind:"Drummer-fronted punk trio from West Chicago, recorded at the Blasting Room with Bill Stevenson producing.",      u:"https://stevesintheband.bandcamp.com/", l1:"Music", u2:"https://www.sitb.org/home", l2:"Site"},
 {n:"The Steves",          s:"unknown", base:"—",               kind:"", u:"https://thestevesss.bandcamp.com/", l1:"Music"},
 {n:"S.M.F.C.",            s:"store", base:"Joliet, IL",        kind:"The solo project of Chicago guitarist Steev Custer, also of Death and Memphis and Space Age Zeros.",                  u:"https://smfc.bandcamp.com/merch"},
 {n:"Bill Nelson",         s:"unknown", base:"—",               kind:""},
 {n:"Dead Freddie",        s:"store", base:"Chicago, IL",       kind:"Punk-pop with roots in Chicago's South Side scene of 1979, reformed in 2013. Yes, there is an accordion.",   u:"https://deadfreddie.bandcamp.com/merch"},
 {n:"From the Start",      s:"unknown", base:"—",               kind:""},
 {n:"The Turdles",         s:"none",  base:"St. Charles, IL",   kind:"Midwestern punk from St. Charles, cheerfully self-described as old, bald and unbothered.",     u:"https://www.reverbnation.com/theturdles", l1:"Music"},
 {n:"Sex Dream",           s:"store", base:"Chicago suburbs",   kind:"Ramonescore with a twee streak from the Chicago suburbs, fronted by Maria Surfinbird since 2018.",                  u:"https://sexxdream.bandcamp.com/merch/mad-kitties-in-space", u2:"https://linktr.ee/sex.dream", l2:"Links"},
 {n:"Anger.",              s:"store", base:"Chicago, IL",       kind:"Chicago hardcore on Punk Rock Tacos Records. Their self-titled LP is dedicated to drummer Matt Meuzelaar.",    u:"https://angerchicago.bandcamp.com/album/anger", l1:"Music"},
 {n:"James the Boneless",  s:"store", base:"Downers Grove, IL", kind:"Downers Grove rock built on an overhand guitar style, with funk bass and saxophone.",       u:"https://jamestheboneless.bandcamp.com/merch"},
 {n:"The Larvettes",       s:"store", base:"Chicago, IL",       kind:"Chicagoland garage rock and roll, going since the early 2020s.",      u:"https://merch.the-larvettes.com/", u2:"https://thelarvettes.bandcamp.com/", l2:"Music"},
 {n:"The Jobodys",         s:"none",  base:"—",                 kind:""},
 {n:"Tone Zone Skam",      s:"store", base:"Chicago area",      kind:"Chicago-area ska, playing Berwyn halls and Burlington Bar bills since 2013.",                  u:"https://tonezoneskam.bandcamp.com/", l1:"Music"},
 {n:"The Come Alongs",     s:"site",  base:"Central Indiana",   kind:"Central Indiana trio moving between classic rock, rockabilly, indie and punk.", u:"https://www.thecomealongsband.com", l1:"Site"},
 {n:"Tiger Uppercut",      s:"unknown", base:"—",               kind:"", u:"https://tigeruppercut.bandcamp.com/", l1:"Music", u2:"https://www.facebook.com/TigerUppercutBand/", l2:"Facebook"},
 {n:"Deadfoot",            s:"store", base:"Indianapolis, IN",  kind:"Indianapolis punk trio writing about political corruption, greed, and the occasional love ballad.",      u:"https://deadfoot.bandcamp.com/", l1:"Music", u2:"https://deadfootpunk.com", l2:"Site"},
 {n:"Acton's Dictum",      s:"store", base:"Berwyn, IL",        kind:"Berwyn hardcore punk, releasing through Punk Rock Tacos Records.",                  u:"https://actonsdictum.bandcamp.com/", l1:"Music"},
 {n:"The Rip Ups",         s:"store", base:"Chicago, IL",       kind:"Garage-a-billy punk out of Chicago's alleys — you can mosh to it or dance to it.",                  u:"https://ripups.bandcamp.com/music", l1:"Music"},
 {n:"Jukebox Rejects",     s:"none",  base:"—",                 kind:""},
 {n:"Tÿre Fÿre",           s:"store", base:"Chicago, IL",       kind:"Chicago punk born at the Alley, played entirely by fifty-year-old men from Elk Grove Village.",u:"https://tyrefyre.bandcamp.com/merch", u2:"https://www.tyre-fyre.com/", l2:"Site"},
 {n:"Alex Kasznel & the Board of Directors", s:"store", base:"Cincinnati, OH", kind:"Cincinnati punk with vinyl on Air Quotes Records. Note the poster spells the name Kesznel.", u:"https://alexkasznel.bandcamp.com/merch"},
 {n:"Cherry Phox",         s:"none",  base:"—",                 kind:""},
 {n:"MG Bailey",           s:"store", base:"Homewood, IL",      kind:"Homewood one-man band, six albums deep, blending punk, blues, pop and soul.",    u:"https://mgbailey7.bandcamp.com/", l1:"Music", u2:"https://mgbailey.com", l2:"Site"},
 {n:"After the Fight",     s:"store", base:"Elgin, IL",         kind:"Melodic punk from Elgin since 2004 — four married guys, not hardcore, as they put it.", u:"https://afterthefight.bandcamp.com/", l1:"Music", u2:"http://www.afterthefight.com", l2:"Site"},
 {n:"The Foley's",         s:"store", base:"South Bend, IN",    kind:"Wrestlepunk from South Bend: punk rock, professional wrestling and bad decisions.", u:"https://wreckedhooliganshop.com", l1:"Shop", u2:"https://wreckedhooligan.bandcamp.com/album/truth-or-consequences", l2:"Bandcamp"},
 {n:"Tongan Death Grip",   s:"store", base:"Waukegan, IL",      kind:"Waukegan metal formed in 2012 out of a shared love of pro wrestling.",            u:"https://tdg316.bandcamp.com/merch"},
 {n:"Counterfeit Goods",   s:"none",  base:"Oxford, OH",        kind:"Four-piece punk from Oxford, Ohio, pulling from rockabilly, soul, ska and jazz."},
 {n:"Low Range",           s:"none",  base:"—",                 kind:""},
 {n:"Rabid Wreck",         s:"none",  base:"—",                 kind:"",            u:"https://www.instagram.com/rabid_wreck/", l1:"Instagram"},
 {n:"Misunderstood",       s:"store", base:"Richmond, IN",      kind:"Richmond, Indiana punk, started in 2006 by Lyn-Z when she was fifteen.", u:"https://misunderstood.bandcamp.com/merch"},
 {n:"Dracula Johnson",     s:"none",  base:"—",                 kind:""},
 {n:"13-Monsters",         s:"store", base:"West Chicago, IL",  kind:"West Chicago rock that went on hiatus back in 2017 — this looks like a reunion.",                  u:"https://13-monsters.bandcamp.com/merch", u2:"https://13-monsters.tumblr.com/", l2:"Tumblr"},
 {n:"Noodle Brain",        s:"store", base:"Chicago, IL",       kind:"Illinois pop-punk duo releasing through Outloud! Records and Laptop Punk Records.", u:"https://noodlebrain.bandcamp.com/merch", u2:"https://storefrontier.com", l2:"Shop"},
 {n:"Cinema Violence",     s:"none",  base:"—",                 kind:""},
 {n:"Los Kausas",          s:"none",  base:"—",                 kind:""},
 {n:"Shukin & the Ramblers",s:"store",base:"Chicago, IL",       kind:"Chicago blues, R&B, roots country and gypsy jazz played with a punk edge.",      u:"https://shukinandtheramblers.bandcamp.com/", l1:"Music", u2:"https://shukinandtheramblers.com/", l2:"Site"},
 {n:"The Helsings",        s:"site",  base:"Indianapolis, IN",  kind:"Indianapolis rock and roll, mixing Ramones energy with Motörhead fury.", u:"https://www.thehelsings.com/", l1:"Site"},
 {n:"Graygarden",          s:"none",  base:"—",                 kind:""},
 {n:"Fishfood",            s:"store", base:"North Freedom, WI", kind:"Silly pop punk rock, as they call it, from North Freedom, Wisconsin.",      u:"https://fishfood.bandcamp.com/", l1:"Music"},
 {n:"Zbyszko Cracker",     s:"store", base:"Wauconda, IL",      kind:"Wauconda experimental noise — including field recordings of mowing the lawn and shovelling snow.", u:"https://seasonalmenswear.bandcamp.com/merch"},
 {n:"Goodbye Sunshine",    s:"store", base:"Chicago, IL",       kind:"Chicago pop-punk produced by Joe Queer, with records on River Monster.", u:"https://goodbyesunshine.bandcamp.com/", l1:"Music", u2:"https://rivermonsterrecords.bandcamp.com", l2:"Label"},
 {n:"Narwhal Express",     s:"none",  base:"Indianapolis, IN",  kind:"",            u:"https://www.instagram.com/narwhal_express/", l1:"Instagram"}
];

/* Draft running order. Swap names between stages freely. */
export const STAGES = ["Deli Stage", "Alley Stage", "Lot Stage"];

export const DAYS: Day[] = [
  {label:"Friday", date:"Sept 11", start:"17:00", lanes:[
    ["Zbyszko Cracker","The Turdles","The Rip Ups","Dead Freddie"],
    ["Cherry Phox","Jukebox Rejects","Noodle Brain","Tÿre Fÿre"],
    []
  ]},
  {label:"Saturday", date:"Sept 12", start:"12:00", lanes:[
    ["Graygarden","Low Range","13-Monsters","Sex Dream","The Larvettes","Acton's Dictum","Anger.","La Armada"],
    ["Narwhal Express","Cinema Violence","The Jobodys","Misunderstood","The Helsings","After the Fight","Tongan Death Grip","Take the Reins"],
    ["Dracula Johnson","Rabid Wreck","Los Kausas","The Come Alongs","Fishfood","Goodbye Sunshine","Tone Zone Skam","Steve's in the Band"]
  ]},
  {label:"Sunday", date:"Sept 13", start:"12:00", lanes:[
    ["Bill Nelson","MG Bailey","Shukin & the Ramblers","The Foley's","Deadfoot"],
    ["From the Start","Counterfeit Goods","Tiger Uppercut","James the Boneless","S.M.F.C."],
    ["The Horrids","The Steves","Alex Kasznel & the Board of Directors"]
  ]}
];

/* Doors: Friday Sept 11, 5:00 PM. */
export const DOORS = "2026-09-11T17:00:00";
/* When the countdown flips from "happening right now" to "that's a wrap". */
export const OVER = "2026-09-14T00:00:00";

/* Set length, gap between sets, and the grid's row size — all in minutes. */
export const SET = 45;
export const GAP = 15;
export const UNIT = 15;

export const byName: Record<string, Band> = Object.fromEntries(
  BANDS.map((b) => [b.n, b])
);
