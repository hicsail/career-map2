export let config = {
	'defaultColor': '#C0C0C0', 
	'onClickHightlightColor': '#5bc0de',
	'stateRecomHighlightColor': '#f0ad4e',
	'accessToken':'pk.eyJ1IjoiaGFyaXJpc2FpbCIsImEiOiJjazZ3aGF2MmkwN2pvM21vYmZtYTJrOG13In0.4IxSwTcKWq1ms7F-B8v2Iw',
	'dataPath': 'data/states-careers-2022-10.json', //'data/states-careers5.json',	
	'propertiesToIds': {
		'PCAPName': {'key': 'PCAP Name','isLink': false},
		'PCAPContact': {'key': 'PCAP Contact','isLink': false},
		'PCAPWebpage': {'key': 'PCAP Webpage','isLink': true},
		'PCAPGuide': {'key': 'PCAP Guide', 'isLink': true},
		'ESSAPlan': {'key': 'ESSA Plan (Equity Approach)','isLink': true},
		'PCAPPlatform': {'key': 'PCAP Technology Platform','isLink': true},
		'PerkinsVPlan': {'key': 'Perkins V (Career & Technical Education-CTE) Plan','isLink': true},
		'K12CTE': {'key': 'K12 CTE','isLink': true},	
		'K12WBL': {'key': 'K12 Work-Based Learning (WBL)','isLink': true},
		'K12WBLGuide': {'key': 'K12 WBL Guide','isLink': true},
		'SEL-Workforce': {'key': 'SEL-Workforce','isLink': true},		
	},
	'stateRecoms': {
		'Personalized Career & Academic Plan (PCAP) Process': ['Alaska', 'Arizona', 'Colorado', 'Connecticut', 'Delaware', 'Iowa', 'Idaho', 'Kansas', 'Kentucky', 'Massachusetts', 'Michigan', 'Minnesota', 'Missouri', 'Ohio', 'Oklahoma', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Virginia', 'Washington', 'Wisconsin'],
		'Social & Emotional Learning (SEL) & Workforce Skills': ['Delaware', 'Kansas', 'Kentucky', 'Massachusetts', 'North Dakota', 'Nevada', 'Ohio', 'Pennsylvania', 'Utah', 'Wisconsin'],
		'Career & Technical Education (CTE) & Career Advising': ['Alabama', 'Connecticut', 'Delaware', 'Illinois', 'Indiana', 'Massachusetts', 'Nevada', 'Ohio', 'Rhode Island', 'Tennessee', 'Virginia', 'Vermont', 'Wisconsin', 'Wyoming'],
		'Work-Based Learning (WBL)': ['Delaware', 'Georgia', 'Iowa', 'Indiana', 'Massachusetts', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'Tennessee', 'Virginia', 'Washington'],
		//'PerkinsVPlan': ['Indiana', 'Rhode Island', 'Wisconsin'],
		//'K12CTE': ['Colorado', 'Illinois', 'Iowa', 'Massachusetts', 'Rhode Island', 'Tennessee', 'Virginia', 'Washington', 'Wisconsin'],
		//'K12WBL': ['Delaware', 'Georgia', 'Iowa', 'Massachusetts', 'Ohio', 'Rhode Island'],
		//'K12WBLGuide': ['Delaware', 'Georgia', 'Iowa', 'Massachusetts', 'Ohio', 'Rhode Island']
	}	
}