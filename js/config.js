export let config = {
	'accessToken':'pk.eyJ1IjoiaGFyaXJpc2FpbCIsImEiOiJjazZ3aGF2MmkwN2pvM21vYmZtYTJrOG13In0.4IxSwTcKWq1ms7F-B8v2Iw',
	'dataPath': 'data/states-careers2.json',	
	'propertiesToIds': {
		'PCAPName': {'key': 'State Personalized Career & Academic Plan (PCAP) Name','isLink': false},
		'PCAPContact': {'key': 'PCAP Contact','isLink': false},
		'PCAPWebpage': {'key': 'State PCAP Webpage','isLink': true},
		'PCAPGuide': {'key': 'PCAP Guide', 'isLink': true},
		'ESSAPlan': {'key': 'ESSA Plan (Equity Approach)','isLink': true},
		'PCAPPlatform': {'key': 'PCAP Technology Platform','isLink': true},
		'PerkinsVPlan': {'key': 'Perkins V (Career & Technical Education-CTE) Plan','isLink': true},
		'K12CTE': {'key': 'K12 CTE','isLink': true},	
		'K12WBL': {'key': 'K12 Work-Based Learning (WBL)','isLink': true},
		'K12WBLGuide': {'key': 'K12 WBL Guide','isLink': true}		
	},
	'stateRecoms': {
		'PCAPWebpage': ['AK', 'CO', 'KS', 'KY', 'OK', 'PA', 'WI'],
		'PCAPGuide': ['CO', 'KS'],
		'PCAPPlatform': ['AL', 'AK', 'MA', 'MN', 'OH', 'SD', 'WI'],
		'ESSAPlan': ['CO', 'KS', 'OH', 'OK', 'PA', 'RI'],
		'PerkinsVPlan': ['IN', 'RI', 'WI'],
		'K12CTE': ['CO', 'IL', 'IA', 'MA', 'RI', 'TN', 'VA', 'WA', 'WI'],
		'K12WBL': ['DE', 'GA', 'IA', 'MA', 'OH', 'RI'],
		'K12WBLGuide': ['DE', 'GA', 'IA', 'MA', 'OH', 'RI']
	}	
}