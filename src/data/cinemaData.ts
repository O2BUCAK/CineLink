export interface Challenge {
  start: string;
  end: string;
}

// Full offline local challenges bank for Turkish and Global sinelinks (Privacy & Free access priority)
export const OFFLINE_CHALLENGES: Challenge[] = [
  { start: "Şener Şen", end: "Cem Yılmaz" },
  { start: "Kemal Sunal", end: "Şener Şen" },
  { start: "Haluk Bilginer", end: "Nuri Bilge Ceylan" },
  { start: "Kıvanç Tatlıtuğ", end: "Beren Saat" },
  { start: "Cüneyt Arkın", end: "Tarık Akan" },
  { start: "Leonardo DiCaprio", end: "Christopher Nolan" },
  { start: "Tom Hanks", end: "Quentin Tarantino" },
  { start: "Al Pacino", end: "Robert De Niro" },
  { start: "Zeki Alasya", end: "Metin Akpınar" },
  { start: "Meltem Cumbul", end: "Keanu Reeves" },
  { start: "Yılmaz Güney", end: "Tuncel Kurtiz" },
  { start: "Sadri Alışık", end: "Türkan Şoray" },
  { start: "Christian Bale", end: "Christopher Nolan" },
  { start: "Brad Pitt", end: "David Fincher" }
];

// High-performance local verification dictionary for zero-cost immediate verification
export const LOCAL_CINEMA_DICTIONARY: Record<string, string> = {
  "şener şen_av mevsimi": "Şener Şen, Av Mevsimi (2010) filminde Komiser Ferman karakteri ile başrolde yer almıştır.",
  "av mevsimi_şener şen": "Şener Şen, Yavuz Turgul imzalı Av Mevsimi (2010) filminde Komiser Ferman karakteriyle başroldedir.",
  "av mevsimi_cem yılmaz": "Cem Yılmaz, Av Mevsimi (2010) filmindeki cinayet şube polisi 'Deli İdris' rolüyle sinemalarda yer almıştır.",
  "cem yılmaz_av mevsimi": "Cem Yılmaz, Av Mevsimi (2010) filmindeki cinayet şube polisi 'Deli İdris' rolüyle sinemalarda yer almıştır.",
  
  "kemal sunal_hababam sınıfı": "Kemal Sunal, Hababam Sınıfı serisinde 'İnek Şaban' rolüyle oynamıştır.",
  "hababam sınıfı_kemal sunal": "Kemal Sunal, Hababam Sınıfı serisinde 'İnek Şaban' rolüyle oynamıştır.",
  "hababam sınıfı_şener şen": "Şener Şen, Hababam Sınıfı serisinde 'Badi Ekrem' rolünü canlandırmıştır.",
  "şener şen_hababam sınıfı": "Şener Şen, Hababam Sınıfı serisinde 'Badi Ekrem' rolünü canlandırmıştır.",

  "nuri bilge ceylan_kış uykusu": "Nuri Bilge Ceylan, 2014 Cannes Altın Palmiye ödüllü Kış Uykusu filminin yönetmenidir.",
  "kış uykusu_nuri bilge ceylan": "Nuri Bilge Ceylan, 2014 Cannes Altın Palmiye ödüllü Kış Uykusu filminin yönetmenidir.",
  "kış uykusu_haluk bilginer": "Haluk Bilginer, Kış Uykusu filminde başkarakter Aydın'ı canlandırmıştır.",
  "haluk bilginer_kış uykusu": "Haluk Bilginer, Kış Uykusu filminde başkarakter Aydın'ı canlandırmıştır.",

  "leonardo dicaprio_inception": "Leonardo DiCaprio, Christopher Nolan'ın yönettiği Inception filminde Dom Cobb rolündedir.",
  "inception_leonardo dicaprio": "Leonardo DiCaprio, Christopher Nolan'ın yönettiği Inception filminde Dom Cobb rolündedir.",
  "inception_christopher nolan": "Christopher Nolan, Inception filminin yönetmeni ve yazarıdır.",
  "christopher nolan_inception": "Christopher Nolan, Inception filminin yönetmeni ve yazarıdır.",

  "yılmaz güney_umut": "Yılmaz Güney, Türk sinemasının başyapıtlarından Umut (1970) filminin yönetmeni ve başrol oyuncusudur.",
  "umut_yılmaz güney": "Yılmaz Güney, Umut (1970) filminde faytoncu Cabbar rolüyle Türk sinema tarihine geçmiştir.",
  "umut_tuncel kurtiz": "Tuncel Kurtiz, Umut (1970) filminde Cabbar'ın can dostu Hasan rolünü oynamıştır.",
  "tuncel kurtiz_umut": "Tuncel Kurtiz, Yılmaz Güney'in Umut filminde Hasan karakterini canlandırmıştır.",

  "christian bale_kara şövalye": "Christian Bale, Christopher Nolan imzalı Kara Şövalye üçlemesinde Bruce Wayne / Batman rolündedir.",
  "kara şövalye_christian bale": "Christian Bale, Kara Şövalye filminde Batman karakterini canlandırmıştır.",
  "kara şövalye_christopher nolan": "Christopher Nolan, The Dark Knight / Kara Şövalye filminin yönetmeni ve ortak senaristidir.",
  "christopher nolan_kara şövalye": "Christopher Nolan, Kara Şövalye filmini yönetmiştir."
};
