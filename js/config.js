export let config = {
	'defaultColor': '#C0C0C0', 
	'onClickHightlightColor': '#5bc0de',
	'stateRecomHighlightColor': '#f0ad4e',
	'accessToken':'pk.eyJ1IjoiaGFyaXJpc2FpbCIsImEiOiJjazZ3aGF2MmkwN2pvM21vYmZtYTJrOG13In0.4IxSwTcKWq1ms7F-B8v2Iw',
	'dataPath': 'data/states-careers-2022-10.json', //'data/states-careers5.json',	
  'scoreDataPath': "data/states-careers-score.json",
  'colorPalette': {
	'youth': {'color': "#3182BD", 'scale': 5},
    'adulthood1': {'color': "#DE2D26",'scale': 5},
    'adulthood2': {'color': "#F17418",'scale': 5},
    'social': {'color': "#756BB1",'scale': 5},
    'overall': {'color': "#31A354",'scale': 5}
  },
  propertiesToIds: {
    PCAPName: { key: "PCAP Name", isLink: false },
    PCAPContact: { key: "PCAP Contact", isLink: false },
    PCAPWebpage: { key: "PCAP Webpage", isLink: true },
    PCAPGuide: { key: "PCAP Guide", isLink: true },
    ESSAPlan: { key: "ESSA Plan (Equity Approach)", isLink: true },
    PCAPPlatform: { key: "PCAP Technology Platform", isLink: true },
    PerkinsVPlan: { key: "Perkins V (Career & Technical Education-CTE) Plan", isLink: true },
    K12CTE: { key: "K12 CTE", isLink: true },
    K12WBL: { key: "K12 Work-Based Learning (WBL)", isLink: true },
    K12WBLGuide: { key: "K12 WBL Guide", isLink: true },
    "SEL-Workforce": { key: "SEL-Workforce", isLink: true },
  },
  propertiesToNames: {
    youth: "Future Ready Youth",
    adulthood1: "Postsecondary Outcomes",
    adulthood2: "Young Adults Deserve a Brighter Future",
    social: "Social Mobility",
    overall: "Overall Score",
    rank: "Rank",
    rank_cr12: "Rank (based on CR score 1 and 2)",
    rank_cr3: "Rank (based on CR score 3)",
    ele_mid_counselor_ratio: "Elementary/Middle School Counselor Ratio 2020-21",
    high_counselor_ratio: "High School Counselor Ratio 2020-21",
    ap: "AP Test Performance of 3 or Higher (2020) (%)",
    fafsa: "Fafsa Completion Rate (%) 2021-22",
    hs_completion: "HS Completion Rate (%) 2018-19 (Cohort based)",
    post_hs_college: "Post HS Placement - college (%) 2018-19 (Cohort based)",
    retention_pt: "Retention rate PT (%) 2019-20",
    retention_ft: "Retention rate FT (%) 2019-20",
    ps_completion_2y: "PS completion (2 years) (%) 2019-20",
    ps_completion_4y: "PS completion (4 years) (%) 2019-20",
    disconnected: "Disconnected youth (%)",
    non_neet_wage: "Median hourly wage of Non-NEET youth($)",
    non_neet_living_wage: "Non-NEET earning more than state's living wage (%)",
    adult_wage: "Median hourly wage of all adult ($)",
    adult_full_time: "Adults working full time (1820h) (%)",
    adult_mit_wage: "Full time adults earning more than MIT wage (%)",
    cr_score100: "CR Score (0~100 score)",
    cr_score1: "CR Score 1 (average of 4 standardized scores)",
    cr_score2: "CR Score 2 (0~100 score from CR score 1)",
    cr_score3: "CR Score 3 (0~100 score by averaging four 0~100 scores)",
  },
  stateRecoms: {
    "Personalized Career & Academic Plan (PCAP) Process": [
      "Alaska",
      "Arizona",
      "Colorado",
      "Connecticut",
      "Delaware",
      "Iowa",
      "Idaho",
      "Kansas",
      "Kentucky",
      "Massachusetts",
      "Michigan",
      "Minnesota",
      "Missouri",
      "Ohio",
      "Oklahoma",
      "Pennsylvania",
      "Rhode Island",
      "South Carolina",
      "South Dakota",
      "Virginia",
      "Washington",
      "Wisconsin",
    ],
    "Social & Emotional Learning (SEL) & Workforce Skills": [
      "Delaware",
      "Kansas",
      "Kentucky",
      "Massachusetts",
      "North Dakota",
      "Nevada",
      "Ohio",
      "Pennsylvania",
      "Utah",
      "Wisconsin",
    ],
    "Career & Technical Education (CTE) & Career Advising": [
      "Alabama",
      "Connecticut",
      "Delaware",
      "Illinois",
      "Indiana",
      "Massachusetts",
      "Nevada",
      "Ohio",
      "Rhode Island",
      "Tennessee",
      "Virginia",
      "Vermont",
      "Wisconsin",
      "Wyoming",
    ],
    "Work-Based Learning (WBL)": [
      "Delaware",
      "Georgia",
      "Iowa",
      "Indiana",
      "Massachusetts",
      "Pennsylvania",
      "Rhode Island",
      "South Carolina",
      "Tennessee",
      "Virginia",
      "Washington",
    ],
    //'PerkinsVPlan': ['Indiana', 'Rhode Island', 'Wisconsin'],
    //'K12CTE': ['Colorado', 'Illinois', 'Iowa', 'Massachusetts', 'Rhode Island', 'Tennessee', 'Virginia', 'Washington', 'Wisconsin'],
    //'K12WBL': ['Delaware', 'Georgia', 'Iowa', 'Massachusetts', 'Ohio', 'Rhode Island'],
    //'K12WBLGuide': ['Delaware', 'Georgia', 'Iowa', 'Massachusetts', 'Ohio', 'Rhode Island']
  },
};
