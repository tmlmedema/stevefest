/* =======================================================================
   DATA — edit here. status: store | site | unknown | none
   ======================================================================= */

export type Band = {
  /** name shown on the site */
  n: string;
  /** False for a band that's dropped out. Their entry stays in the roster —
      the research behind it is worth keeping, and bands come back — but the
      site doesn't show them and they hold no slot on the schedule. Required
      rather than optional so adding a band is a decision, not a default. */
  active: boolean;
  /** optional telephone contact method */
  t?: string;
  /** optional email contact method */
  e?: string;
  /** alternate contact method */
  ac?: string;
  /** label for the alternate contact method (defaults to "Alt Contact") */
  lac?: string;
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
  /** Who's credited under the day tabs while this day is showing. Leave it
      off and the day gets no credit line. Names should match a SPONSORS entry
      — that's where the link comes from, and the logo if this ever wants one. */
  sponsors?: string[];
  /** "YYYY-MM-DD" — the calendar date, for "is the fest on today?" */
  iso: string;
  /** 24-hour "HH:MM" — where the grid's time axis starts */
  start: string;
  /** one list of slots per stage, in playing order */
  lanes: Slot[][];
};

/* Everyone who has ever been on the bill. Use BANDS below for anything the
   site displays — this one is here for the count, the archive and the admin. */
export const ROSTER: Band[] = [
  {
    n: "La Armada",
    active: true,
    t: "954-793-8431",
    e: "armadahardcore@gmail.com",
    s: "store",
    base: "Chicago, IL",
    kind: "La Armada’s focus is to leave their mark on heavy music. A punk band at heart, they utilize elements of Afro-Caribbean rhythms and metal to create a style as unique as their story. Formed in the Dominican Republic in 2001 from where they dominated the Caribbean scene for years, the band opted to take a leap and relocate to Chicago in 2008, where they still reside. Influenced by bands ranging from the Bad Brains to Death, they take elements from their native Island’s music to conjure a unique recipe; explosive live energy, and a clear cut narrative that highlights the effects of neo-colonialism on vulnerable communities.",
    u: "https://www.laarmadamusic.com/category/all-products",
    l1: "Merch",
    u2: "https://www.laarmadamusic.com",
    l2: "Site",
  },
  {
    n: "Take the Reins",
    active: false,
    s: "store",
    base: "Chicago, IL",
    kind: "Chicago rock fronted by Courtney Boyers, on Flat Aht Records. Compared to Joan Jett by way of the Pretenders.",
    u: "https://takethereins.bandcamp.com/merch",
    u2: "https://linktr.ee/takethereins",
    l2: "Links",
  },
  {
    n: "The Horrids",
    active: true,
    s: "unknown",
    base: "Lombard, IL",
    kind: "Horror-fueled street punk from the gutters of Lombard, Illinois, raising hell since 2003. Has bled on stages alongside with Misfits, Michale Graves, The Casualties, GWAR, The Unseen, Lower Class Brats, Flatfoot 56, Nekromantix, and Blitzkid.",
    u: "https://open.spotify.com/album/5iSImthAyZD3dBSoAZpcE0?si=Azv5wbcoR7yGg8TQ16Fl8A",
    l1: "Music",
  },
  {
    n: "Steve's in the Band",
    active: true,
    t: "847-791-9587",
    s: "store",
    base: "West Chicago, IL",
    kind: "Local Skate Punk",
    u: "https://distrokid.com/hyperfollow/sitb/steves-in-the-band-5",
    l1: "Music",
    u2: "https://d6c769-3a.myshopify.com/?utm_source=ig&utm_medium=social&utm_content=link_in_bio",
    l2: "Merch",
    u3: "https://linktr.ee/stevesintheband",
    l3: "Links",
  },
  {
    n: "The Steves",
    active: true,
    s: "unknown",
    base: "—",
    kind: "",
    u: "https://thestevesss.bandcamp.com/",
    l1: "Music",
  },
  {
    n: "S.M.F.C.",
    active: true,
    s: "store",
    base: "Joliet, IL",
    kind: "The solo project of Chicago guitarist Steev Custer, also of Death and Memphis and Space Age Zeros.",
    u: "https://smfc.bandcamp.com/",
    l1: "Merch",
    u2: "https://www.facebook.com/profile.php?id=61563588361268",
    l2: "Facebook",
  },
  {
    n: "Bill Nelson",
    active: true,
    s: "unknown",
    base: "Chicago, IL",
    kind: "",
  },
  {
    n: "Dead Freddie",
    active: true,
    e: "donatasramanauskas@rocketmail.com",
    s: "store",
    base: "Chicago, IL",
    kind: "Dead Freddie IS Chicago Garage Rock and Power Pop blended with UK Punk with a touch of Ska , originally emerging from Chicago’s South Side in 1979, reincarnating in 2013. The band has three releases on vinyl, most recently in 2023 with a fourth album in the works. They are known for their high-energy live shows, with the accordion adding something unexpected to the mix. “This Chicago pop punk band is rooted in that town’s original late-’70s punk scene, even before Strike Under, The Effigies, Naked Raygun…Their sound is full of the Windy City’s over-the-top-hard-punk-with- melodic-undertow tradition” (Big Takeover, No. 87).   Current members of the band are Gintas Buinevicius (drums & backing vocals), Gary Vacha (guitar), Karl Sperling (bass), and Donatas Ramanauskas (lead vocals and accordion).",
    u: "https://deadfreddie.bandcamp.com/",
    l1: "Merch"
  },
  {
    n: "From the Start",
    active: true,
    t: "630-936-1471",
    e: "Fromthestartbooking@gmail.com",
    ac: "https://www.instagram.com/fromthestartil",
    lac: "Instagram",
    s: "unknown",
    base: "Chicago, IL",
    kind: "Fun music for fun people!",
    u: "https://linktr.ee/fromthestart",
    l1: "Links",
    u2: "https://fromthestart.bandcamp.com/",
    l2: "Music",
  },
  {
    n: "The Turdles",
    active: true,
    s: "none",
    base: "St. Charles, IL",
    kind: "Midwestern punk from St. Charles, cheerfully self-described as old, bald and unbothered.",
    u: "https://www.reverbnation.com/theturdles",
    l1: "Music",
  },
  {
    n: "Sex Dream",
    active: true,
    s: "store",
    base: "Chicago suburbs",
    kind: "Ramonescore with a twee streak from the Chicago suburbs, fronted by Maria Surfinbird since 2018.",
    u: "https://sexxdream.bandcamp.com/merch/mad-kitties-in-space",
    u2: "https://linktr.ee/sex.dream",
    l2: "Links",
  },
  {
    n: "Anger.",
    active: true,
    s: "store",
    base: "Chicago, IL",
    kind: "Chicago hardcore on Punk Rock Tacos Records. Their self-titled LP is dedicated to drummer Matt Meuzelaar.",
    u: "https://angerchicago.bandcamp.com/album/anger",
    l1: "Music",
  },
  {
    n: "James the Boneless",
    active: true,
    t: "630-638-9358",
    s: "store",
    base: "Chicago, IL",
    kind: "Chicago-based weirdo psych art punk with missing bones theatrics, funky bass, thunder drums, and soaring outer space guitar leads.",
    u: "https://ebay.io/m/z5Fida",
    l1: "Merch",
    u2: "https://www.instagram.com/jamestheboneless",
    l2: "Instagram",
  },
  {
    n: "The Larvettes",
    active: true,
    s: "store",
    base: "Lombard, IL",
    kind: "A garage pop punk band from the early 20s.",
    u: "https://thelarvettes.bandcamp.com/",
    l1: "Music",
    u2: "https://merch.the-larvettes.com/",
    l2: "Merch",
  },
  {
    n: "The Nobodies",
    active: true,
    s: "none",
    base: "Chicago, IL",
    kind: "Performing as a duo for this fest. They combine a punk-derived recklessness and garage-rock sensibility with lyrical wit and a bittersweet vulnerability. Their songs will help you forget your troubles and remember your triumphs.",
    u: "https://open.spotify.com/artist/6hWys8p2m6T7h4kqaolUSh?si=b4L771NTTn-N-U8ZyXk-zA",
    l1: "Music",
    u2: "https://thenobodieschicagousa.hearnow.com/",
    l2: "Site",
  },
  {
    n: "Tone Zone Skam",
    active: true,
    s: "store",
    base: "Chicago area",
    kind: "Chicago-area ska, playing Berwyn halls and Burlington Bar bills since 2013.",
    u: "https://tonezoneskam.bandcamp.com/",
    l1: "Music",
  },
  {
    n: "The Come Alongs",
    active: true,
    s: "site",
    base: "Central Indiana",
    kind: "Central Indiana trio moving between classic rock, rockabilly, indie and punk.",
    u: "https://www.thecomealongsband.com",
    l1: "Site",
  },
  {
    n: "Tiger Uppercut",
    active: true,
    s: "unknown",
    base: "Kingston, Ontario",
    kind: "",
    u: "https://tigeruppercut.bandcamp.com/",
    l1: "Music",
    u2: "https://www.facebook.com/TigerUppercutBand/",
    l2: "Facebook",
  },
  {
    n: "Deadfoot",
    active: true,
    s: "store",
    base: "Indianapolis, IN",
    kind: "Indianapolis punk trio writing about political corruption, greed, and the occasional love ballad.",
    u: "https://deadfoot.bandcamp.com/",
    l1: "Music",
    u2: "https://deadfootpunk.com",
    l2: "Site",
  },
  {
    n: "Acton's Dictum",
    active: true,
    s: "site",
    base: "Berwyn, IL | Valparaiso, IN",
    kind: "Wobbly stoner anarcho-prog-punk from Berwyn, IL / Valparaiso, IN.",
    u: "https://linktr.ee/actonsdictum",
    l1: "Links",
  },
  {
    n: "The Rip Ups",
    active: true,
    s: "store",
    base: "Chicago, IL",
    kind: "Garage-a-billy punk out of Chicago's alleys — you can mosh to it or dance to it.",
    u: "https://ripups.bandcamp.com/music",
    l1: "Music",
  },
  {
    n: "Jukebox Rejects",
    active: true,
    s: "none",
    base: "Appleton, WI",
    kind: "",
  },
  {
    n: "Tÿre Fÿre",
    active: true,
    s: "store",
    base: "Chicago, IL",
    kind: "Chicago punk born at the Alley, played entirely by fifty-year-old men from Elk Grove Village.",
    u: "https://tyrefyre.bandcamp.com/merch",
    u2: "https://www.tyre-fyre.com/",
    l2: "Site",
  },
  {
    n: "Alex Kasznel & the Board of Directors",
    active: true,
    e: "booking@akandthebod.com",
    s: "store",
    base: "Cincinnati, OH",
    kind: "The Board of Directors are a punk rock-fueled power-pop trio from Cincinnati. Since forming in 2023, they've released several albums and EPs, and performed over 200 times across the US and Canada. They're known for an energetic and light-hearted stage presence, and lyrically-driven, complex-but-catchy songs.",
    u: "https://alexkasznel.bandcamp.com/merch",
    l1: "Merch",
    u2: "https://akandthebod.com/",
    l2: "Site",
  },
  {
    n: "Cherry Phox",
    active: true,
    s: "none",
    base: "Lombard, IL",
    kind: "",
  },
  {
    n: "MG Bailey",
    active: true,
    e: "mgbaileyonemanband@gmail.com",
    s: "store",
    base: "Homewood, IL",
    kind: "MG Bailey Rocks🤘🏼",
    u: "https://mgbailey7.bandcamp.com/",
    l1: "Music",
    u2: "https://mgbailey.com",
    l2: "Site",
  },
  {
    n: "After the Fight",
    active: true,
    s: "store",
    e: "afterthefight@gmail.com",
    base: "Addison, IL",
    kind: "Chicago-area punk rock - melodic and loud, intense and un-serious, not hardcore since 2004.",
    u: "https://afterthefight.bandcamp.com/",
    l1: "Music",
    u2: "https://nothardcoresince2004.com/",
    l2: "Site",
    u3: "https://nothardcoresince2004.com/merch",
    l3: "Merch",
  },
  {
    n: "The Foleys",
    active: true,
    e: "thefoleys@wreckedhooligan.com",
    s: "store",
    base: "South Bend, IN",
    kind: "The Foleys are South Bend’s Wrestle Punk main event — loud, chant-along chaos fueled by real Midwest heart. Blending pro-wrestling intensity with high-energy punk hooks, they turn every show into a sweat-soaked underdog victory.",
    u: "https://wreckedhooligan.bandcamp.com/album/truth-or-consequences",
    l1: "Music",
    u2: "https://www.facebook.com/TheFoleysPunk/",
    l2: "Facebook",
    u3: "https://thefoleys574.com/merch",
    l3: "Merch",
  },
  {
    n: "Tongan Death Grip",
    active: true,
    s: "store",
    base: "Waukegan, IL",
    kind: "Waukegan metal formed in 2012 out of a shared love of pro wrestling.",
    u: "https://tdg316.bandcamp.com/merch",
  },
  {
    n: "Counterfeit Goods",
    active: true,
    s: "none",
    base: "Oxford, OH",
    kind: "Four-piece punk from Oxford, Ohio, pulling from rockabilly, soul, ska and jazz.",
  },
  {
    n: "Low Range",
    active: true,
    s: "none",
    base: "—",
    kind: "Chicago-style power trio",
  },
  {
    n: "Rabid Wreck",
    active: true,
    s: "none",
    base: "—",
    kind: "",
    u: "https://www.instagram.com/rabid_wreck/",
    l1: "Instagram",
  },
  {
    n: "Misunderstood",
    active: true,
    s: "store",
    base: "Richmond, IN",
    kind: "Richmond, Indiana punk, started in 2006 by Lyn-Z when she was fifteen.",
    u: "https://misunderstood.bandcamp.com/merch",
  },
  {
    n: "Dracula Johnson",
    active: true,
    s: "none",
    base: "—",
    kind: "",
  },
  {
    n: "13-Monsters",
    active: true,
    s: "store",
    base: "Chicago, IL",
    kind: "A Chicago grungy psyche band led by Deb Sonzo. They are a band you'd expect to hear in a Tarantino movie. A dark-basement-with-candles-fog-and-loud-amplifiers kind of band that consistently leaves people with that “why haven’t I been here til now?” feeling. They host several festivals of their own own, including The Rock & Roll Circus Side Shows, Baconstöck and GOATSTÖCK. All of their releases are on Circus Side Show Records.",
    u: "https://13-monsters.bandcamp.com/merch",
    u2: "https://13-monsters.tumblr.com/",
    l2: "Tumblr",
  },
  {
    n: "Noodle Brain",
    active: true,
    s: "store",
    base: "Chicago, IL",
    kind: "Illinois pop-punk duo releasing through Outloud! Records and Laptop Punk Records.",
    u: "https://noodlebrain.bandcamp.com/music",
    l1: "Music",
  },
  // {
  //   n: "Cinema Violence",
  //   active: true,
  //   s: "none",
  //   base: "—",
  //   kind: "",
  // },
  {
    n: "Los Kausas",
    active: true,
    s: "none",
    base: "—",
    kind: "",
  },
  {
    n: "Shukin & the Ramblers",
    active: true,
    s: "store",
    base: "Chicago, IL",
    kind: "Chicago blues, R&B, roots country and gypsy jazz played with a punk edge.",
    u: "https://shukinandtheramblers.bandcamp.com/",
    l1: "Music",
    u2: "https://shukinandtheramblers.com/",
    l2: "Site",
  },
  {
    n: "The Helsings",
    active: true,
    s: "site",
    base: "Indianapolis, IN",
    kind: "Indianapolis rock and roll, mixing Ramones energy with Motörhead fury.",
    u: "https://www.thehelsings.com/",
    l1: "Site",
  },
  {
    n: "Graygarden",
    active: true,
    s: "site",
    base: "Central Indiana",
    kind: "Alt/pop punk with a tinge of post-hardcore edge from Central Indiana. Formed in 2019 with the goal of writing fun, intricate, strong music with melodic and catchy vocals.",
    u: "http://distrokid.com/hyperfollow/graygarden/for-your-consideration/",
    l1: "Music",
    u2: "https://graygardenmusic.com",
    l2: "Site",
  },
  {
    n: "Fishfood",
    active: true,
    s: "store",
    base: "North Freedom, WI",
    kind: "Silly pop punk rock, as they call it, from North Freedom, Wisconsin.",
    u: "https://fishfood.bandcamp.com/",
    l1: "Music",
    u2: "https://www.youtube.com/@Eibot100",
    l2: "YouTube",
    u3: "https://www.instagram.com/fishfd321/",
    l3: "Instagram",
  },
  {
    n: "Zbyszko Cracker",
    active: true,
    s: "store",
    base: "Wauconda, IL",
    kind: "As if Jack Benny led a band that combined Rage Against The Machine with Atom & His Package but built the whole thing using glow-in-the-dark Better Blocks and a kalimba.",
    u: "https://seasonalmenswear.bandcamp.com/merch",
  },
  {
    n: "Goodbye Sunshine",
    active: true,
    e: "goodbye.sunshine.music@gmail.com",
    s: "store",
    base: "Chicago, IL",
    kind: "The Motely Crue of Pop Punk",
    u: "https://open.spotify.com/artist/5CzE85COaS1eYmQwbvljTP?si=lWpfCQ-1Sw2GVVeCc30xvg",
    l1: "Spotify",
    u2: "https://rivermonsterrecords.bandcamp.com",
    l2: "Label",
  },
  {
    n: "Narwhal Express",
    active: true,
    s: "none",
    base: "Indianapolis, IN",
    kind: "Anti-fa punk/alt-rock band out of Indy.",
    u: "https://open.spotify.com/artist/2naBgDMwE0cANdZQzXIEva?si=hD_81wimRLOVahLXM76UTQ",
    l1: "Music",
    u2: "https://www.instagram.com/narwhal_express/",
    l2: "Instagram",
  },
  {
    n: "The Assistant Managers",
    active: true,
    s: "unknown",
    base: "—",
    kind: "",
  },
  {
    n: "Dead End On Sarah",
    active: false,
    s: "unknown",
    base: "Mishawaka, IN",
    kind: "",
  },
  {
    n: "Gunnar Linden",
    active: true,
    s: "unknown",
    base: "Chicago, IL",
    kind: "This musical passion is the real deal, born from a decade of carving his own path—working overnight shifts to get time on university pianos and taking his music full-time. He brings skill, energy, and a truly unique show to every performance",
    u: "https://www.instagram.com/gunnar_linden_",
    l1: "Instagram",
  },
  {
    n: "PUGZ",
    active: true,
    s: "unknown",
    base: "—",
    kind: "",
  },
  {
    n: "Aaron Williams Performing The Wooz",
    active: true,
    s: "unknown",
    base: "Chicago, IL",
    kind: "",
  },
  {
    n: "Trevor Hill",
    active: true,
    s: "unknown",
    base: "—",
    kind: "",
  },
  {
    n: "Davey J",
    active: true,
    s: "unknown",
    base: "—",
    kind: "",
  },
  {
    n: "A FrumpyKnot",
    active: true,
    s: "unknown",
    base: "Lombard, IL",
    kind: "",
  },
  {
    n: "MfoV",
    active: true,
    s: "none",
    base: "Maywood, IL",
    kind: "Chicago-area punk trio — self-described, tongue firmly in cheek, as \"3 pambazo specials from MayHood IL.\"",
    u: "https://mfov123.bandcamp.com/album/early-shit",
    l1: "Music",
    u2: "https://www.instagram.com/mfov123.band",
    l2: "Instagram",
  },
  {
    n: "Keith Bondi",
    active: true,
    s: "unknown",
    base: "—",
    kind: "",
  },
  {
    n: "EL Fa",
    active: true,
    s: "unknown",
    base: "—",
    kind: "",
  },
  {
    n: "Hesterménage à Trois",
    active: true,
    s: "unknown",
    ac: "https://www.instagram.com/hesterman_band_",
    lac: "Instagram",
    base: "Glen Ellyn, IL",
    kind: "Hesterménage à Trois also known as Hesterman is a4 piece original band from Glen Ellyn, IL. We originally started over 20 years ago, took a brief hiatus and have been playing the past few years!",
    u: "https://www.youtube.com/playlist?list=OLAK5uy_mp7W4AWftS_fVYaNBDcDzb2r-bv8DeTLI",
    l1: "YouTube",

  },
  {
    n: "The Jobodys",
    active: true,
    s: "unknown",
    base: "Villa Park, IL",
    kind: "",
  },
];

/* Source: Schedule_SFII_with_acoustic.pdf (the poster), transcribed via
   steve_fest_ii_schedule sheet. "SITB" is "Steve's in the Band" under the
   name printed on the poster, normalized here to the one name.

   The Jobodys and The Nobodies are two different bands, however alike the
   poster makes them look: the Jobodys play Sunday, the Nobodies Saturday. */
export const STAGES = ["Main Stage", "Side Stage", "Rooftop Stage"];

export const DAYS: Day[] = [
  {label:"Friday", date:"Sept 11", iso:"2026-09-11", start:"16:00", sponsors:["Carpool"], lanes:[
    [{t:"17:00",n:"From the Start",len:30},{t:"18:00",n:"S.M.F.C.",len:30},{t:"19:00",n:"The Come Alongs",len:30},{t:"20:00",n:"Steve's in the Band",len:30},{t:"21:00",n:"The Horrids",len:45},{t:"22:15",n:"La Armada",len:45}],
    [{t:"17:30",n:"Cherry Phox",len:30},{t:"18:30",n:"Low Range",len:30},{t:"19:30",n:"Alex Kasznel & the Board of Directors",len:30},{t:"20:30",n:"Acton's Dictum",len:30},{t:"21:45",n:"Anger.",len:30}],
    [{t:"17:00",n:"Keith Bondi"},{t:"18:00",n:"EL Fa"},{t:"19:00",n:"S.M.F.C."},{t:"20:00",n:"Bill Nelson"},{t:"21:00",n:"The Assistant Managers"}]
  ]},
  {label:"Saturday", date:"Sept 12", iso:"2026-09-12", start:"11:00", sponsors:["Dobies Printing LLC"], lanes:[
    [{t:"12:00",n:"Dead Freddie"},{t:"13:10",n:"13-Monsters",len:25},{t:"14:00",n:"Graygarden",len:25},{t:"14:50",n:"Dracula Johnson",len:30},{t:"15:45",n:"The Helsings",len:30},{t:"16:40",n:"The Foleys",len:30},{t:"17:35",n:"After the Fight",len:30},{t:"18:30",n:"The Larvettes",len:25},{t:"19:20",n:"The Steves",len:30},{t:"20:10",n:"Sex Dream",len:30},{t:"21:10",n:"Jukebox Rejects",len:30},{t:"22:10",n:"Bill Nelson",len:45}],
    [{t:"12:45",n:"Fishfood",len:25},{t:"13:40",n:"Narwhal Express",len:25},{t:"14:25",n:"The Rip Ups",len:25},{t:"15:20",n:"Misunderstood",len:25},{t:"16:15",n:"Goodbye Sunshine",len:25},{t:"17:10",n:"Tongan Death Grip",len:25},{t:"18:05",n:"Noodle Brain",len:25},{t:"18:55",n:"Tÿre Fÿre",len:25},{t:"19:50",n:"Zbyszko Cracker",len:20},{t:"20:40",n:"Rabid Wreck",len:30},{t:"21:40",n:"The Turdles",len:30}],
    [{t:"14:00",n:"Gunnar Linden"},{t:"15:00",n:"PUGZ"},{t:"16:00",n:"Hesterménage à Trois"},{t:"17:00",n:"Aaron Williams Performing The Wooz"},{t:"18:00",n:"Dracula Johnson"},{t:"19:00",n:"The Nobodies"},{t:"20:00",n:"Cherry Phox"}]
  ]},
  {label:"Sunday", date:"Sept 13", iso:"2026-09-13", start:"11:00", sponsors:["JL Vintage","Eating Soup Daily"], lanes:[
    [{t:"13:30",n:"James the Boneless", len:30},{t:"14:30",n:"Shukin & the Ramblers", len:30},{t:"15:30",n:"Tone Zone Skam", len:30},{t:"16:30",n:"Los Kausas", len:30},{t:"17:30",n:"Tiger Uppercut", len:30}],
    [{t:"12:00",n:"Steve's in the Band", len:30},{t:"13:00",n:"MG Bailey", len:30},{t:"14:00",n:"The Jobodys", len:30},{t:"15:00",n:"Counterfeit Goods", len:30},{t:"16:00",n:"Deadfoot", len:30},{t:"17:00",n:"MfoV", len:30}],
    [{t:"13:00",n:"Trevor Hill"},{t:"14:00",n:"Davey J"},{t:"15:00",n:"Noodle Brain"},{t:"16:00",n:"A FrumpyKnot"}]
  ]}
];

export type Sponsor = {
  /** name as it should read — also the logo's alt text */
  name: string;
  /** path under /public */
  src: string;
  /** intrinsic pixel size, so the browser reserves the right box up front */
  w: number;
  h: number;
  /** their site, or null if they haven't got one */
  href: string | null;
};

/* The logos are artwork on a white ground rather than transparent marks, so
   wherever they land they need a paper tile behind them. */
export const SPONSORS: Sponsor[] = [
  { name: "Shannon's Deli", src: "/assets/sponsors/shannons-deli.png", w: 2560, h: 806, href: "https://shannonsdeli.net/" },
  { name: "Blind Corner Brewery", src: "/assets/sponsors/blind-corner-brewery.png", w: 1460, h: 1268, href: "https://www.blindcornerbrewery.com/" },
  { name: "Punk Rock Saves Lives", src: "/assets/logo-punk-rock-saves-lives.png", w: 360, h: 360, href: "https://www.punkrocksaveslives.org/" },
  { name: "Carpool", src: "/assets/sponsors/carpool.png", w: 336, h: 336, href: null },
  { name: "Dobies Printing LLC", src: "/assets/sponsors/dobies-printing.png", w: 500, h: 500, href: "https://dobiesprinting.com/" },
  { name: "Eating Soup Daily", src: "/assets/sponsors/eating-soup-daily.jpg", w: 1080, h: 1080, href: "https://www.tiktok.com/@nagernadnerb" },
  { name: "JL Vintage", src: "/assets/sponsors/jl-vintage.jpg", w: 1304, h: 1600, href: "https://www.jlvintage.com/" },
  { name: "I Heart DTL", src: "/assets/dtl-heart.svg", w: 1254, h: 1254, href: "https://iheartdtl.com/" },
];


/* Doors: Friday Sept 11, 5:00 PM. */
export const DOORS = "2026-09-11T17:00:00";
/* When the countdown flips from "happening right now" to "that's a wrap". */
export const OVER = "2026-09-14T00:00:00";

/* When the photo wall accepts uploads from the public. Outside this window
   only signed-in admins can add to it — see app/lib/wall.ts.

   Set to the three festival days: all of Friday the 11th through the end of
   Sunday the 13th. Set either to null to shut that end of the window — both
   null means admins only, always.

   These are Chicago wall-clock times — write the time you'd read off a clock
   at the deli, and daylight saving is worked out for you. The format is
   YYYY-MM-DDTHH:MM:SS, 24-hour, no offset on the end. */
export const WALL_OPENS: string | null = "2026-09-11T00:00:00";
export const WALL_CLOSES: string | null = "2026-09-13T23:59:59";

/* Default set length when a slot doesn't specify one, and the grid's row size — both in minutes. */
export const DEFAULT_LEN = 45;
export const UNIT = 5;

/* Every band name is upper-cased by the CSS. This one is styled as written,
   so it reads as a name rather than a shout. */
export const nameStyle = (name: string) =>
  name === "A FrumpyKnot" ? { textTransform: "none" as const } : undefined;

/* What the site shows: the roster minus anyone who's dropped out. Everything
   that renders or counts bands reads this, so a band going inactive takes
   them off the page, out of the lineup and out of the tally in one edit. */
export const BANDS: Band[] = ROSTER.filter((b) => b.active);

/* Built off the whole roster, not just BANDS — a lookup for a band who has
   since dropped should still find their details rather than come back empty. */
export const byName: Record<string, Band> = Object.fromEntries(
  ROSTER.map((b) => [b.n, b])
);

export const sponsorByName: Record<string, Sponsor> = Object.fromEntries(
  SPONSORS.map((s) => [s.name, s])
);
