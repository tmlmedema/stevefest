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
  /** an optional third link */
  u3?: string;
  /** label for the third link (defaults to "More") */
  l3?: string;
};

export type Slot = {
  /** 24-hour "HH:MM" start time */
  t: string;
  /** band name */
  n: string;
  /** set length in minutes (defaults to DEFAULT_LEN) */
  len?: number;
};

export type Day = {
  label: string;
  date: string;
  /** 24-hour "HH:MM" — where the grid's time axis starts */
  start: string;
  /** one list of slots per stage, in playing order */
  lanes: Slot[][];
};

export const BANDS: Band[] = [
 {n:"La Armada",           s:"store", base:"Chicago, IL",       kind:"Latino hardcore fury, formed in Santo Domingo and based in Chicago since 2008. Has toured with Sick of It All and Propagandhi.", u:"https://www.merchbar.com/rock-alternative/la-armada"},
 {n:"Take the Reins",      s:"store", base:"Chicago, IL",       kind:"Chicago rock fronted by Courtney Boyers, on Flat Aht Records. Compared to Joan Jett by way of the Pretenders.",       u:"https://takethereins.bandcamp.com/merch", u2:"https://linktr.ee/takethereins", l2:"Links"},
 {n:"The Horrids",         s:"unknown", base:"Lombard, IL",     kind:"Horror-fueled street punk from the gutters of Lombard, Illinois, raising hell since 2003. Has bled on stages alongside with Misfits, Michale Graves, The Casualties, GWAR, The Unseen, Lower Class Brats, Flatfoot 56, Nekromantix, and Blitzkid.", u:"https://open.spotify.com/album/5iSImthAyZD3dBSoAZpcE0?si=Azv5wbcoR7yGg8TQ16Fl8A", l1:"Music"},
 {n:"Steve's in the Band", s:"store", base:"West Chicago, IL",  kind:"Drummer-fronted punk trio from West Chicago, recorded at the Blasting Room with Bill Stevenson producing.",      u:"https://stevesintheband.bandcamp.com/", l1:"Music", u2:"https://www.sitb.org/home", l2:"Site"},
 {n:"The Steves",          s:"unknown", base:"—",               kind:"", u:"https://thestevesss.bandcamp.com/", l1:"Music"},
 {n:"S.M.F.C.",            s:"store", base:"Joliet, IL",        kind:"The solo project of Chicago guitarist Steev Custer, also of Death and Memphis and Space Age Zeros.",                  u:"https://smfc.bandcamp.com/merch"},
 {n:"Bill Nelson",         s:"unknown", base:"—",               kind:""},
 {n:"Dead Freddie",        s:"store", base:"Chicago, IL",       kind:"Punk-pop with roots in Chicago's South Side scene of 1979, reformed in 2013. Yes, there is an accordion.",   u:"https://deadfreddie.bandcamp.com/merch"},
 {n:"From the Start",      s:"unknown", base:"—",               kind:""},
 {n:"The Turdles",         s:"none",  base:"St. Charles, IL",   kind:"Midwestern punk from St. Charles, cheerfully self-described as old, bald and unbothered.",     u:"https://www.reverbnation.com/theturdles", l1:"Music"},
 {n:"Sex Dream",           s:"store", base:"Chicago suburbs",   kind:"Ramonescore with a twee streak from the Chicago suburbs, fronted by Maria Surfinbird since 2018.",                  u:"https://sexxdream.bandcamp.com/merch/mad-kitties-in-space", u2:"https://linktr.ee/sex.dream", l2:"Links"},
 {n:"Anger.",              s:"store", base:"Chicago, IL",       kind:"Chicago hardcore on Punk Rock Tacos Records. Their self-titled LP is dedicated to drummer Matt Meuzelaar.",    u:"https://angerchicago.bandcamp.com/album/anger", l1:"Music"},
 {n:"James the Boneless",  s:"store", base:"Chicago, IL",       kind:"Chicago-based weirdo psych art punk with missing bones theatrics, funky bass, thunder drums, and soaring outer space guitar leads.",       u:"https://jamestheboneless.bandcamp.com/merch"},
 {n:"The Larvettes",       s:"store", base:"Chicago, IL",       kind:"A garage pop punk band from the the early 20s.",      u:"https://thelarvettes.bandcamp.com/", l1:"Music", u2:"https://merch.the-larvettes.com/", l2:"Buy"},
 {n:"The Nobodies",        s:"none",  base:"Chicago, IL",       kind:"Performing as a duo for this fest. They combine a punk-derived recklessness and garage-rock sensibility with lyrical wit and a bittersweet vulnerability. Their songs will help you forget your troubles and remember your triumphs.", u:"https://open.spotify.com/artist/6hWys8p2m6T7h4kqaolUSh?si=b4L771NTTn-N-U8ZyXk-zA", l1:"Music", u2:"https://thenobodieschicagousa.hearnow.com/", l2:"Site"},
 {n:"Tone Zone Skam",      s:"store", base:"Chicago area",      kind:"Chicago-area ska, playing Berwyn halls and Burlington Bar bills since 2013.",                  u:"https://tonezoneskam.bandcamp.com/", l1:"Music"},
 {n:"The Come Alongs",     s:"site",  base:"Central Indiana",   kind:"Central Indiana trio moving between classic rock, rockabilly, indie and punk.", u:"https://www.thecomealongsband.com", l1:"Site"},
 {n:"Tiger Uppercut",      s:"unknown", base:"—",               kind:"", u:"https://tigeruppercut.bandcamp.com/", l1:"Music", u2:"https://www.facebook.com/TigerUppercutBand/", l2:"Facebook"},
 {n:"Deadfoot",            s:"store", base:"Indianapolis, IN",  kind:"Indianapolis punk trio writing about political corruption, greed, and the occasional love ballad.",      u:"https://deadfoot.bandcamp.com/", l1:"Music", u2:"https://deadfootpunk.com", l2:"Site"},
 {n:"Acton's Dictum",      s:"site",  base:"Berwyn, IL | Valparaiso, IN", kind:"Wobbly stoner anarcho-prog-punk from Berwyn, IL / Valparaiso, IN.",                  u:"https://linktr.ee/actonsdictum", l1:"Links"},
 {n:"The Rip Ups",         s:"store", base:"Chicago, IL",       kind:"Garage-a-billy punk out of Chicago's alleys — you can mosh to it or dance to it.",                  u:"https://ripups.bandcamp.com/music", l1:"Music"},
 {n:"Jukebox Rejects",     s:"none",  base:"—",                 kind:""},
 {n:"Tÿre Fÿre",           s:"store", base:"Chicago, IL",       kind:"Chicago punk born at the Alley, played entirely by fifty-year-old men from Elk Grove Village.",u:"https://tyrefyre.bandcamp.com/merch", u2:"https://www.tyre-fyre.com/", l2:"Site"},
 {n:"Alex Kasznel & the Board of Directors", s:"store", base:"Cincinnati, OH", kind:"Cincinnati pop-punk trio formed in 2023, calling their sound \"pop punk for grownups.\"", u:"https://alexkasznel.bandcamp.com/", l1:"Music", u2:"https://akandthebod.com/", l2:"Site"},
 {n:"Cherry Phox",         s:"none",  base:"—",                 kind:""},
 {n:"MG Bailey",           s:"store", base:"Homewood, IL",      kind:"Homewood one-man band, six albums deep, blending punk, blues, pop and soul.",    u:"https://mgbailey7.bandcamp.com/", l1:"Music", u2:"https://mgbailey.com", l2:"Site"},
 {n:"After the Fight",     s:"store", base:"Elgin, IL",         kind:"Chicago-area punk rock - melodic and loud, intense and un-serious, not hardcore since 2004.", u:"https://afterthefight.bandcamp.com/", l1:"Music", u2:"http://www.afterthefight.com", l2:"Site"},
 {n:"The Foleys",          s:"store", base:"South Bend, IN",    kind:"Wrestlepunk from South Bend: punk rock, professional wrestling and bad decisions.", u:"https://wreckedhooligan.bandcamp.com/album/truth-or-consequences", l1:"Music", u2:"https://thefoleys574.com/listen", l2:"Site", u3:"https://wreckedhooliganshop.com", l3:"Shop"},
 {n:"Tongan Death Grip",   s:"store", base:"Waukegan, IL",      kind:"Waukegan metal formed in 2012 out of a shared love of pro wrestling.",            u:"https://tdg316.bandcamp.com/merch"},
 {n:"Counterfeit Goods",   s:"none",  base:"Oxford, OH",        kind:"Four-piece punk from Oxford, Ohio, pulling from rockabilly, soul, ska and jazz."},
 {n:"Low Range",           s:"none",  base:"—",                 kind:""},
 {n:"Rabid Wreck",         s:"none",  base:"—",                 kind:"",            u:"https://www.instagram.com/rabid_wreck/", l1:"Instagram"},
 {n:"Misunderstood",       s:"store", base:"Richmond, IN",      kind:"Richmond, Indiana punk, started in 2006 by Lyn-Z when she was fifteen.", u:"https://misunderstood.bandcamp.com/merch"},
 {n:"Dracula Johnson",     s:"none",  base:"—",                 kind:""},
 {n:"13-Monsters",         s:"store", base:"West Chicago, IL",  kind:"West Chicago rock that went on hiatus back in 2017 — this looks like a reunion.",                  u:"https://13-monsters.bandcamp.com/merch", u2:"https://13-monsters.tumblr.com/", l2:"Tumblr"},
 {n:"Noodle Brain",        s:"store", base:"Chicago, IL",       kind:"Illinois pop-punk duo releasing through Outloud! Records and Laptop Punk Records.", u:"https://noodlebrain.bandcamp.com/music", l1:"Music"},
 {n:"Cinema Violence",     s:"none",  base:"—",                 kind:""},
 {n:"Los Kausas",          s:"none",  base:"—",                 kind:""},
 {n:"Shukin & the Ramblers",s:"store",base:"Chicago, IL",       kind:"Chicago blues, R&B, roots country and gypsy jazz played with a punk edge.",      u:"https://shukinandtheramblers.bandcamp.com/", l1:"Music", u2:"https://shukinandtheramblers.com/", l2:"Site"},
 {n:"The Helsings",        s:"site",  base:"Indianapolis, IN",  kind:"Indianapolis rock and roll, mixing Ramones energy with Motörhead fury.", u:"https://www.thehelsings.com/", l1:"Site"},
 {n:"Graygarden",          s:"site",  base:"Central Indiana",   kind:"Alt/pop punk with a tinge of post-hardcore edge from Central Indiana. Formed in 2019 with the goal of writing fun, intricate, strong music with melodic and catchy vocals.", u:"http://distrokid.com/hyperfollow/graygarden/for-your-consideration/", l1:"Music", u2:"https://graygardenmusic.com", l2:"Site"},
 {n:"Fishfood",            s:"store", base:"North Freedom, WI", kind:"Silly pop punk rock, as they call it, from North Freedom, Wisconsin.",      u:"https://fishfood.bandcamp.com/", l1:"Music", u2:"https://www.youtube.com/@Eibot100", l2:"YouTube", u3:"https://www.instagram.com/fishfd321/", l3:"Instagram"},
 {n:"Zbyszko Cracker",     s:"store", base:"Wauconda, IL",      kind:"As if Jack Benny led a band that combined Rage Against The Machine with Atom & His Package but built the whole thing using glow-in-the-dark Better Blocks and a kalimba.", u:"https://seasonalmenswear.bandcamp.com/merch"},
 {n:"Goodbye Sunshine",    s:"store", base:"Chicago, IL",       kind:"Chicago pop-punk produced by Joe Queer, with records on River Monster.", u:"https://goodbyesunshine.bandcamp.com/", l1:"Music", u2:"https://rivermonsterrecords.bandcamp.com", l2:"Label"},
 {n:"Narwhal Express",     s:"none",  base:"Indianapolis, IN",  kind:"Anti-fa punk/alt-rock band out of Indy.", u:"https://open.spotify.com/artist/2naBgDMwE0cANdZQzXIEva?si=hD_81wimRLOVahLXM76UTQ", l1:"Music", u2:"https://www.instagram.com/narwhal_express/", l2:"Instagram"},
 {n:"Ass Managers",        s:"unknown", base:"—",               kind:""},
 {n:"Dead End On Sarah",   s:"unknown", base:"—",               kind:""},
 {n:"Gunnar Linden",       s:"unknown", base:"—",               kind:"", u:"https://www.instagram.com/gunnar_linden_music/", l1:"Instagram"},
 {n:"PUGZ",                s:"unknown", base:"—",               kind:""},
 {n:"The Wooz",            s:"unknown", base:"—",               kind:""},
 {n:"Trevor Hill",         s:"unknown", base:"—",               kind:""},
 {n:"Davey Jay",           s:"unknown", base:"—",               kind:""},
 {n:"A FrumpyKnot",        s:"unknown", base:"—",               kind:""},
 {n:"MfoV",                s:"none",  base:"Maywood, IL",       kind:"Chicago-area punk trio — self-described, tongue firmly in cheek, as \"3 pambazo specials from MayHood IL.\"", u:"https://mfov123.bandcamp.com/album/early-shit", l1:"Music", u2:"https://www.instagram.com/mfov123.band", l2:"Instagram"},
 {n:"Keith Bondi",         s:"unknown", base:"—",               kind:""},
 {n:"EL Fa",                s:"unknown", base:"—",               kind:""},
 {n:"Hesterménage à Trois", s:"unknown", base:"—",               kind:""}
];

/* Source: Schedule_SFII_with_acoustic.pdf (the poster), transcribed via
   steve_fest_ii_schedule sheet. "SITB" and "the Nobodies"/"The Jobodys"
   are the same acts as "Steve's in the Band" and "The Nobodies" under
   the names printed on the poster — normalized here to one name each. */
export const STAGES = ["Main Stage", "Side Stage", "Rooftop Stage"];

export const DAYS: Day[] = [
  {label:"Friday", date:"Sept 11", start:"16:00", lanes:[
    [{t:"17:00",n:"From the Start"},{t:"18:00",n:"S.M.F.C."},{t:"19:00",n:"The Come Alongs"},{t:"20:00",n:"Steve's in the Band"},{t:"21:00",n:"The Horrids"},{t:"22:00",n:"La Armada"}],
    [{t:"17:30",n:"Cherry Phox"},{t:"18:30",n:"Low Range"},{t:"19:30",n:"Alex Kasznel & the Board of Directors"},{t:"20:30",n:"Acton's Dictum"},{t:"21:30",n:"Anger."}],
    [{t:"17:00",n:"Keith Bondi"},{t:"18:00",n:"EL Fa"},{t:"19:00",n:"S.M.F.C."},{t:"20:00",n:"Bill Nelson"},{t:"21:00",n:"Ass Managers"}]
  ]},
  {label:"Saturday", date:"Sept 12", start:"11:00", lanes:[
    [{t:"12:00",n:"Dead Freddie"},{t:"13:10",n:"13-Monsters",len:25},{t:"14:00",n:"Graygarden",len:25},{t:"14:50",n:"Dracula Johnson",len:30},{t:"15:45",n:"The Helsings",len:30},{t:"16:40",n:"The Foleys",len:30},{t:"17:35",n:"After the Fight",len:30},{t:"18:30",n:"The Larvettes",len:25},{t:"19:20",n:"The Steves",len:30},{t:"20:10",n:"Sex Dream",len:30},{t:"21:10",n:"Jukebox Rejects",len:30},{t:"22:10",n:"Bill Nelson",len:45}],
    [{t:"12:45",n:"Fishfood",len:25},{t:"13:40",n:"Narwhal Express",len:25},{t:"14:25",n:"The Rip Ups",len:25},{t:"15:20",n:"Misunderstood",len:25},{t:"16:15",n:"Goodbye Sunshine",len:25},{t:"17:10",n:"Tongan Death Grip",len:25},{t:"18:05",n:"Noodle Brain",len:25},{t:"18:55",n:"Tÿre Fÿre",len:25},{t:"19:50",n:"Zbyszko Cracker",len:20},{t:"20:40",n:"Rabid Wreck",len:30},{t:"21:40",n:"The Turdles",len:30}],
    [{t:"13:00",n:"Dead End On Sarah"},{t:"14:00",n:"Gunnar Linden"},{t:"15:00",n:"PUGZ"},{t:"16:00",n:"Hesterménage à Trois"},{t:"17:00",n:"The Wooz"},{t:"18:00",n:"Dracula Johnson"},{t:"19:00",n:"The Nobodies"},{t:"20:00",n:"Cherry Phox"}]
  ]},
  {label:"Sunday", date:"Sept 13", start:"11:00", lanes:[
    [{t:"12:30",n:"Take the Reins"},{t:"13:30",n:"James the Boneless"},{t:"14:30",n:"Shukin & the Ramblers"},{t:"15:30",n:"Tone Zone Skam"},{t:"16:30",n:"Los Kausas"},{t:"17:30",n:"Tiger Uppercut"}],
    [{t:"12:00",n:"Steve's in the Band"},{t:"13:00",n:"MG Bailey"},{t:"14:00",n:"The Nobodies"},{t:"15:00",n:"Counterfeit Goods"},{t:"16:00",n:"Deadfoot"},{t:"17:00",n:"MfoV"}],
    [{t:"13:00",n:"Trevor Hill"},{t:"14:00",n:"Davey Jay"},{t:"15:00",n:"Noodle Brain"},{t:"16:00",n:"A FrumpyKnot"}]
  ]}
];

/* Doors: Friday Sept 11, 5:00 PM. */
export const DOORS = "2026-09-11T17:00:00";
/* When the countdown flips from "happening right now" to "that's a wrap". */
export const OVER = "2026-09-14T00:00:00";

/* Default set length when a slot doesn't specify one, and the grid's row size — both in minutes. */
export const DEFAULT_LEN = 45;
export const UNIT = 5;

export const byName: Record<string, Band> = Object.fromEntries(
  BANDS.map((b) => [b.n, b])
);
