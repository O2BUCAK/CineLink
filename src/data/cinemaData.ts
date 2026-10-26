export interface Challenge {
  start: string;
  end: string;
}

// Multi-hop challenges bank: Start and End have NEVER worked directly in the same movie.
// Each challenge requires at least 2 or more intermediate film connections (en az 2 film ve 1 ara sanatçı).
export const OFFLINE_CHALLENGES: Challenge[] = [
  { start: "Şener Şen", end: "Leonardo DiCaprio" },
  { start: "Kemal Sunal", end: "Quentin Tarantino" },
  { start: "Haluk Bilginer", end: "Keanu Reeves" },
  { start: "Christian Bale", end: "Nuri Bilge Ceylan" },
  { start: "Türkan Şoray", end: "Al Pacino" },
  { start: "Cem Yılmaz", end: "Christopher Nolan" },
  { start: "Kıvanç Tatlıtuğ", end: "Robert De Niro" },
  { start: "Cüneyt Arkın", end: "Tom Hanks" },
  { start: "Sadri Alışık", end: "Martin Scorsese" },
  { start: "Meltem Cumbul", end: "David Fincher" },
  { start: "Beren Saat", end: "Christian Bale" },
  { start: "Tuncel Kurtiz", end: "Quentin Tarantino" },
  { start: "Yılmaz Güney", end: "Brad Pitt" },
  { start: "Tarık Akan", end: "Johnny Depp" },
  { start: "Zeki Alasya", end: "Robert De Niro" },
  { start: "Uğur Yücel", end: "Leonardo DiCaprio" }
];

// High-performance local verification dictionary for zero-cost immediate verification
export const LOCAL_CINEMA_DICTIONARY: Record<string, string> = {
  // Şener Şen & Av Mevsimi & Cem Yılmaz & Eşkıya & Gönül Yarası
  "şener şen_av mevsimi": "Şener Şen, Av Mevsimi (2010) filminde Komiser Ferman karakteri ile başrolde yer almıştır.",
  "av mevsimi_şener şen": "Şener Şen, Yavuz Turgul imzalı Av Mevsimi (2010) filminde Komiser Ferman karakteriyle başroldedir.",
  "av mevsimi_cem yılmaz": "Cem Yılmaz, Av Mevsimi (2010) filmindeki cinayet şube polisi 'Deli İdris' rolüyle sinemalarda yer almıştır.",
  "cem yılmaz_av mevsimi": "Cem Yılmaz, Av Mevsimi (2010) filmindeki cinayet şube polisi 'Deli İdris' rolüyle sinemalarda yer almıştır.",
  "şener şen_eşkıya": "Şener Şen, Yavuz Turgul'un unutulmaz Eşkıya (1996) filminde Baran karakterini canlandırmıştır.",
  "eşkıya_şener şen": "Şener Şen, Eşkıya filminde başroldedir.",
  "eşkıya_uğur yücel": "Uğur Yücel, Eşkıya (1996) filminde Cumali rolünü oynamıştır.",
  "uğur yücel_eşkıya": "Uğur Yücel, Eşkıya (1996) filminde Cumali karakteriyle yer almıştır.",
  "şener şen_gönül yarası": "Şener Şen, Gönül Yarası (2005) filminde emekli öğretmen Nazım rolündedir.",
  "gönül yarası_şener şen": "Şener Şen, Gönül Yarası filminde başroldedir.",
  "gönül yarası_meltem cumbul": "Meltem Cumbul, Gönül Yarası (2005) filminde Dünya karakterini canlandırmıştır.",
  "meltem cumbul_gönül yarası": "Meltem Cumbul, Gönül Yarası filminde başroldedir.",

  // Cem Yılmaz / Yılmaz Erdoğan / Russell Crowe (The Water Diviner / Son Umut)
  "cem yılmaz_son umut": "Cem Yılmaz, Russell Crowe'un yönettiği Son Umut (The Water Diviner - 2014) filminde Çavuş Cemal rolünü oynamıştır.",
  "son umut_cem yılmaz": "Cem Yılmaz, Son Umut filminde Çavuş Cemal karakterini oynamıştır.",
  "yılmaz erdoğan_son umut": "Yılmaz Erdoğan, Son Umut filminde Binbaşı Hasan rolüyle Avustralya Sinema ve Televizyon Sanatları Ödülü (AACTA) kazanmıştır.",
  "son umut_yılmaz erdoğan": "Yılmaz Erdoğan, Son Umut filminde Binbaşı Hasan karakterini canlandırmıştır.",
  "russell crowe_son umut": "Russell Crowe, Son Umut (The Water Diviner - 2014) filminin yönetmeni ve başrol oyuncusudur.",
  "son umut_russell crowe": "Russell Crowe, Son Umut filminde Connor rolündedir.",

  // Russell Crowe & Hollywood Connections
  "russell crowe_body of lies": "Russell Crowe, Ridley Scott'ın yönettiği Body of Lies (Yalanlar Üstüne - 2008) filminde Ed Hoffman rolündedir.",
  "body of lies_russell crowe": "Russell Crowe, Body of Lies filminde CIA şefi Ed Hoffman rolündedir.",
  "leonardo dicaprio_body of lies": "Leonardo DiCaprio, Body of Lies (2008) filminde başroldeki Roger Ferris karakterini canlandırmıştır.",
  "body of lies_leonardo dicaprio": "Leonardo DiCaprio, Body of Lies filminde başroldedir.",
  "russell crowe_gladyatör": "Russell Crowe, Ridley Scott imzalı Gladyatör (2000) filminde Maximus Decimus Meridius rolüyle Oscar kazanmıştır.",
  "gladyatör_russell crowe": "Russell Crowe, Gladyatör filminde Maximus rolündedir.",
  "gladyatör_joaquin phoenix": "Joaquin Phoenix, Gladyatör filminde İmparator Commodus rolündedir.",
  "joaquin phoenix_gladyatör": "Joaquin Phoenix, Gladyatör filminde Commodus karakterini oynamıştır.",

  // Kemal Sunal & Yeşilçam
  "kemal sunal_hababam sınıfı": "Kemal Sunal, Hababam Sınıfı serisinde 'İnek Şaban' rolüyle oynamıştır.",
  "hababam sınıfı_kemal sunal": "Kemal Sunal, Hababam Sınıfı serisinde 'İnek Şaban' rolüyle oynamıştır.",
  "hababam sınıfı_şener şen": "Şener Şen, Hababam Sınıfı serisinde 'Badi Ekrem' rolünü canlandırmıştır.",
  "şener şen_hababam sınıfı": "Şener Şen, Hababam Sınıfı serisinde 'Badi Ekrem' rolünü canlandırmıştır.",
  "halit akçatepe_hababam sınıfı": "Halit Akçatepe, Hababam Sınıfı'nda Güdük Necmi rolündedir.",
  "hababam sınıfı_halit akçatepe": "Halit Akçatepe, Hababam Sınıfı'nda Güdük Necmi karakterini canlandırmıştır.",

  // Nuri Bilge Ceylan & Haluk Bilginer
  "nuri bilge ceylan_kış uykusu": "Nuri Bilge Ceylan, 2014 Cannes Altın Palmiye ödüllü Kış Uykusu filminin yönetmenidir.",
  "kış uykusu_nuri bilge ceylan": "Nuri Bilge Ceylan, 2014 Cannes Altın Palmiye ödüllü Kış Uykusu filminin yönetmenidir.",
  "kış uykusu_haluk bilginer": "Haluk Bilginer, Kış Uykusu filminde başkarakter Aydın'ı canlandırmıştır.",
  "haluk bilginer_kış uykusu": "Haluk Bilginer, Kış Uykusu filminde başkarakter Aydın'ı canlandırmıştır.",

  // Haluk Bilginer & Uluslararası
  "haluk bilginer_the international": "Haluk Bilginer, Tom Tykwer'ın The International (2009) filminde Ahmet Sunay karakterini canlandırmıştır.",
  "the international_haluk bilginer": "Haluk Bilginer, The International filminde Ahmet Sunay karakterini canlandırmıştır.",
  "clive owen_the international": "Clive Owen, The International (2009) filminde Louis Salinger rolünde başroldedir.",
  "the international_clive owen": "Clive Owen, The International filminde başroldedir.",
  "clive owen_sin city": "Clive Owen, Sin City (Günah Şehri - 2005) filminde Dwight McCarthy rolündedir.",
  "sin city_clive owen": "Clive Owen, Sin City filminde Dwight rolündedir.",
  "bruce willis_sin city": "Bruce Willis, Sin City (2005) filminde John Hartigan rolündedir.",
  "sin city_bruce willis": "Bruce Willis, Sin City filminde Hartigan rolündedir.",

  // Pulp Fiction & Quentin Tarantino
  "bruce willis_pulp fiction": "Bruce Willis, Quentin Tarantino'nun Pulp Fiction (1994) filminde boksör Butch Coolidge rolündedir.",
  "pulp fiction_bruce willis": "Bruce Willis, Pulp Fiction filminde Butch rolündedir.",
  "quentin tarantino_pulp fiction": "Quentin Tarantino, sinema tarihinin başyapıtlarından Pulp Fiction (1994) filminin yazarı ve yönetmenidir.",
  "pulp fiction_quentin tarantino": "Quentin Tarantino, Pulp Fiction filmini yönetmiştir.",
  "john travolta_pulp fiction": "John Travolta, Pulp Fiction filminde Vincent Vega rolündedir.",
  "pulp fiction_john travolta": "John Travolta, Pulp Fiction filminde Vincent Vega karakterini oynamıştır.",
  "samuel l. jackson_pulp fiction": "Samuel L. Jackson, Pulp Fiction filminde Jules Winnfield rolündedir.",
  "pulp fiction_samuel l. jackson": "Samuel L. Jackson, Pulp Fiction filminde Jules karakterini oynamıştır.",

  // Christopher Nolan & Leonardo DiCaprio & Christian Bale
  "leonardo dicaprio_inception": "Leonardo DiCaprio, Christopher Nolan'ın yönettiği Inception filminde Dom Cobb rolündedir.",
  "inception_leonardo dicaprio": "Leonardo DiCaprio, Christopher Nolan'ın yönettiği Inception filminde Dom Cobb rolündedir.",
  "inception_christopher nolan": "Christopher Nolan, Inception filminin yönetmeni ve yazarıdır.",
  "christopher nolan_inception": "Christopher Nolan, Inception filminin yönetmeni ve yazarıdır.",
  "christian bale_kara şövalye": "Christian Bale, Christopher Nolan imzalı Kara Şövalye üçlemesinde Bruce Wayne / Batman rolündedir.",
  "kara şövalye_christian bale": "Christian Bale, Kara Şövalye filminde Batman karakterini canlandırmıştır.",
  "kara şövalye_christopher nolan": "Christopher Nolan, The Dark Knight / Kara Şövalye filminin yönetmeni ve ortak senaristidir.",
  "christopher nolan_kara şövalye": "Christopher Nolan, Kara Şövalye filmini yönetmiştir.",
  "michael caine_kara şövalye": "Michael Caine, Kara Şövalye filminde Alfred Pennyworth rolündedir.",
  "kara şövalye_michael caine": "Michael Caine, Kara Şövalye filminde Alfred rolündedir.",

  // Michael Caine & Harvey Keitel & Youth
  "michael caine_youth": "Michael Caine, Paolo Sorrentino'nun Cannes ödüllü Youth (Gençlik - 2015) filminde Fred Ballinger rolündedir.",
  "youth_michael caine": "Michael Caine, Youth filminde Fred Ballinger rolündedir.",
  "harvey keitel_youth": "Harvey Keitel, Paolo Sorrentino'nun Youth filminde Mick Boyle rolündedir.",
  "youth_harvey keitel": "Harvey Keitel, Youth filminde Mick Boyle rolündedir.",
  "harvey keitel_rezervuar köpekleri": "Harvey Keitel, Quentin Tarantino'nun Reservoir Dogs (Rezervuar Köpekleri - 1992) filminde Mr. White rolündedir.",
  "rezervuar köpekleri_harvey keitel": "Harvey Keitel, Rezervuar Köpekleri filminde Mr. White rolündedir.",
  "quentin tarantino_rezervuar köpekleri": "Quentin Tarantino, Rezervuar Köpekleri (1992) filminin yazarı ve yönetmenidir.",
  "rezervuar köpekleri_quentin tarantino": "Quentin Tarantino, Rezervuar Köpekleri filmini yönetmiştir.",

  // Brad Pitt & David Fincher & Fight Club & Se7en
  "brad pitt_fight club": "Brad Pitt, David Fincher'ın Dövüş Kulübü (Fight Club - 1999) filminde Tyler Durden rolündedir.",
  "fight club_brad pitt": "Brad Pitt, Fight Club filminde Tyler Durden rolündedir.",
  "david fincher_fight club": "David Fincher, Fight Club (1999) filminin yönetmenidir.",
  "fight club_david fincher": "David Fincher, Fight Club filmini yönetmiştir.",
  "edward norton_fight club": "Edward Norton, Fight Club filminde anlatıcı (The Narrator) rolündedir.",
  "fight club_edward norton": "Edward Norton, Fight Club filminde başroldedir.",

  // Robert De Niro & Al Pacino & Martin Scorsese
  "robert de niro_the irishman": "Robert De Niro, Martin Scorsese'nin The Irishman (2019) filminde Frank Sheeran rolündedir.",
  "the irishman_robert de niro": "Robert De Niro, The Irishman filminde Frank Sheeran rolündedir.",
  "al pacino_the irishman": "Al Pacino, The Irishman (2019) filminde Jimmy Hoffa rolündedir.",
  "the irishman_al pacino": "Al Pacino, The Irishman filminde Jimmy Hoffa rolündedir.",
  "martin scorsese_the irishman": "Martin Scorsese, The Irishman (2019) filminin yönetmenidir.",
  "the irishman_martin scorsese": "Martin Scorsese, The Irishman filminin yönetmenidir.",

  // Yılmaz Güney & Tuncel Kurtiz & Umut
  "yılmaz güney_umut": "Yılmaz Güney, Türk sinemasının başyapıtlarından Umut (1970) filminin yönetmeni ve başrol oyuncusudur.",
  "umut_yılmaz güney": "Yılmaz Güney, Umut (1970) filminde faytoncu Cabbar rolüyle Türk sinema tarihine geçmiştir.",
  "umut_tuncel kurtiz": "Tuncel Kurtiz, Umut (1970) filminde Cabbar'ın can dostu Hasan rolünü oynamıştır.",
  "tuncel kurtiz_umut": "Tuncel Kurtiz, Yılmaz Güney'in Umut filminde Hasan karakterini canlandırmıştır.",

  // Türkan Şoray & Kadir İnanır (Selvi Boylum Al Yazmalım)
  "türkan şoray_selvi boylum al yazmalım": "Türkan Şoray, Selvi Boylum Al Yazmalım (1977) filminde Asya karakteri ile başrolde yer almıştır.",
  "selvi boylum al yazmalım_türkan şoray": "Türkan Şoray, Selvi Boylum Al Yazmalım filminde Asya rolündedir.",
  "kadir inanır_selvi boylum al yazmalım": "Kadir İnanır, Selvi Boylum Al Yazmalım filminde İlyas karakteri ile başroldedir.",
  "selvi boylum al yazmalım_kadir inanır": "Kadir İnanır, Selvi Boylum Al Yazmalım filminde İlyas rolündedir."
};
