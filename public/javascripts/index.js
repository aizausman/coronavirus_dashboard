
//Implementation of world map with COVID-19 cases 
Highcharts.ajax({
    url: 'https://raw.githubusercontent.com/aizausman/coronavirus_dashboard/master/dataset.csv',
    dataType: 'csv',
    success: function (csv) {
  
     // Very simple and case-specific CSV string splitting
      function CSVtoArray(text) {
        return text.split(',');
      }
  
      csv = csv.split(/\n/);
      
      
      var countries = {},
        mapChart,
        numRegex = /^[0-9\.]+$/,
        lastCommaRegex = /,\s$/,
        quoteRegex = /\"/g,
        //get columns - dates from 22 jan to 25 April
        categories = CSVtoArray(csv[0]).slice(1);


      // Parse the CSV into arrays, one array each country
      csv.slice(1).forEach(function (line) {
        var row = CSVtoArray(line),
        //cases for each country in an array
          data = row.slice(1);
  
        data.forEach(function (val, i) {
          val = val.replace(quoteRegex, '');
          if (numRegex.test(val)) {
            val = parseInt(val, 10);
          } else if (!val || lastCommaRegex.test(val)) {
            val = null;
          }
          data[i] = val;
        });
        
        //create country object with vountry name and cases over 2 months as data
        countries[row[0]] = {
          name: row[0],
          data: data
        };
    });
  
      // For each country, use the latest value for current population
      var data = [];
      for (var name in countries) {
        if (Object.hasOwnProperty.call(countries, name)) {
          var value = null,
            date,
            itemData = countries[name].data,
            i = itemData.length;
  
          while (i--) {
            if (typeof itemData[i] === 'number') {
              value = parseInt(itemData[i+1]);
              date = categories[i+1];
              break;
            }
          }
          data.push({
            name: name,
            value: value,
            date: date
          });
        }
      }

      // Initiate the map chart
      var mapData = Highcharts.geojson(Highcharts.maps['custom/world']);

      mapChart = Highcharts.mapChart('container', {
  
        title: {
          text: 'COVID-19 Cases by Country'
        },

  
        mapNavigation: {
          enabled: true,
          buttonOptions: {
            verticalAlign: 'bottom'
          }
        },
  
        colorAxis: {
            dataClasses: [{
                to: 100
            }, {
                from: 100,
                to: 500
            }, {
                from: 500,
                to: 1000
            }, {
                from: 1000,
                to: 5000
            }, {
                from: 5000,
                to: 10000
            }, {
                from: 10000,
                to: 50000
            }, {
                from: 50000
            }]
        },
  
        
        series: [{
          data: data,
          mapData: mapData,
          joinBy: ['name', 'name'],
          name: 'COVID-19 Cases',
          allowPointSelect: true,
          cursor: 'pointer',
          states: {
            select: {
              color: '#edb9a4',
              borderColor: 'white'
            }
          },
          borderWidth: 0.5
        }],

        //get news for COVID-19
        plotOptions:{
            series:{
                point:{
                    events:{
                        click: function(){
            
                            var country_code = getCountryCode(this.name); 
                            var url = 'http://newsapi.org/v2/top-headlines?' +
                            'country=' + country_code + "&" +
                            'q=COVID-19&pageSize=3&' +
                            'apiKey=893bf728eaef4d7fa90802479981c24e';
                            console.log(url);
                            var req = new Request(url);
                            fetch(req)
                            .then((response) => response.json())
                            .then((data) => {
                                // console.log(data)
                                document.getElementById("news").style.display = "flex";
                                document.getElementById("data-table").style.display = "flex";
                                document.getElementById("heading").style.display = "flex";

                                imgs = document.getElementsByTagName("img")
                                titles = document.getElementsByTagName("h5")
                                timestamp = document.getElementsByTagName('p')
                                url = document.getElementsByTagName("a")

                                country_name = document.getElementsByTagName('h3')[0]
                                country_name.textContent = this.name;

                                for(let i=0; i<3; i++){
                                    
                                    imgs[i].src = data.articles[i].urlToImage;
                                    titles[i].textContent = data.articles[i].title; 
                                    url[i].href = data.articles[i].url;
                                    timestamp[i].textContent = data.articles[i].publishedAt;
                                    
                                }
                            })


                            recent_cases = countries[this.name].data;
                            recent_cases = (recent_cases.slice(Math.max(recent_cases.length - 6, 1))).reverse();
                            recent_dates = (categories.slice(Math.max(categories.length - 5, 1))).reverse();

                            total_cases = document.getElementsByClassName('total')[0];
                            total_cases.textContent = "Total Confirmed Cases: " + recent_cases[0];


                            population_infected = document.getElementsByClassName('infected')[0];
                            population_infected.textContent = "Population infected = " + ((recent_cases[0]/getCountryPopulation(this.name))*100).toFixed(2) + "%"

                            for(let i=0; i<recent_dates.length; i++){
                                date = recent_dates[i];
                                month = recent_dates[i][0];
                                recent_dates[i] = date.replace(month,'April-');
                            }
                             
                            table_date = document.getElementsByClassName('date')
                            table_cases = document.getElementsByClassName('cases')
                            table_percent = document.getElementsByClassName('percent')

                            for(let i=0; i<5; i++){
                                table_date[i].textContent = recent_dates[i];
                                table_cases[i].textContent = recent_cases[i];

                                percent_change = 0
                                if (recent_cases[i] - recent_cases[i+1] > 0){
                                    percent_change = ((recent_cases[i] - recent_cases[i+1])/recent_cases[i+1]) * 100
                                    table_percent[i].textContent = Math.round(percent_change)+ '%';
                                    table_percent[i].style.color = "red"
                                }
                                else {
                                    percent_change = ((recent_cases[i+1] - recent_cases[i])/recent_cases[i+1]) * 100
                                    table_percent[i].textContent = Math.round(percent_change)+ '%';
                                    table_percent[i].style.color = "green"
                                }
                                
                            }


                            
                        }
                    }
                }
            }
        }
      });
  
    }
  });
  

  function getCountryCode (country) {
    var codes = {
    'Afghanistan' : 'AF',
    'Aland Islands' : 'AX',
    'Albania' : 'AL',
    'Algeria' : 'DZ',
    'American Samoa' : 'AS',
    'Andorra' : 'AD',
    'Angola' : 'AO',
    'Anguilla' : 'AI',
    'Antarctica' : 'AQ',
    'Antigua And Barbuda' : 'AG',
    'Argentina' : 'AR',
    'Armenia' : 'AM',
    'Aruba' : 'AW',
    'Australia' : 'AU',
    'Austria' : 'AT',
    'Azerbaijan' : 'AZ',
    'Bahamas' : 'BS',
    'Bahrain' : 'BH',
    'Bangladesh' : 'BD',
    'Barbados' : 'BB',
    'Belarus' : 'BY',
    'Belgium' : 'BE',
    'Belize' : 'BZ',
    'Benin' : 'BJ',
    'Bermuda' : 'BM',
    'Bhutan' : 'BT',
    'Bolivia' : 'BO',
    'Bosnia And Herzegovina' : 'BA',
    'Botswana' : 'BW',
    'Bouvet Island' : 'BV',
    'Brazil' : 'BR',
    'British Indian Ocean Territory' : 'IO',
    'Brunei Darussalam' : 'BN',
    'Bulgaria' : 'BG',
    'Burkina Faso' : 'BF',
    'Burundi' : 'BI',
    'Cambodia' : 'KH',
    'Cameroon' : 'CM',
    'Canada' : 'CA',
    'Cape Verde' : 'CV',
    'Cayman Islands' : 'KY',
    'Central African Republic' : 'CF',
    'Chad' : 'TD',
    'Chile' : 'CL',
    'China' : 'CN',
    'Christmas Island' : 'CX',
    'Cocos (Keeling) Islands' : 'CC',
    'Colombia' : 'CO',
    'Comoros' : 'KM',
    'Congo' : 'CG',
    'Congo, Democratic Republic' : 'CD',
    'Cook Islands' : 'CK',
    'Costa Rica' : 'CR',
    'Cote D\'Ivoire' : 'CI',
    'Croatia' : 'HR',
    'Cuba' : 'CU',
    'Cyprus' : 'CY',
    'Czech Republic' : 'CZ',
    'Denmark' : 'DK',
    'Djibouti' : 'DJ',
    'Dominica' : 'DM',
    'Dominican Republic' : 'DO',
    'Ecuador' : 'EC',
    'Egypt' : 'EG',
    'El Salvador' : 'SV',
    'Equatorial Guinea' : 'GQ',
    'Eritrea' : 'ER',
    'Estonia' : 'EE',
    'Ethiopia' : 'ET',
    'Falkland Islands (Malvinas)' : 'FK',
    'Faroe Islands' : 'FO',
    'Fiji' : 'FJ',
    'Finland' : 'FI',
    'France' : 'FR',
    'French Guiana' : 'GF',
    'French Polynesia' : 'PF',
    'French Southern Territories' : 'TF',
    'Gabon' : 'GA',
    'Gambia' : 'GM',
    'Georgia' : 'GE',
    'Germany' : 'DE',
    'Ghana' : 'GH',
    'Gibraltar' : 'GI',
    'Greece' : 'GR',
    'Greenland' : 'GL',
    'Grenada' : 'GD',
    'Guadeloupe' : 'GP',
    'Guam' : 'GU',
    'Guatemala' : 'GT',
    'Guernsey' : 'GG',
    'Guinea' : 'GN',
    'Guinea-Bissau' : 'GW',
    'Guyana' : 'GY',
    'Haiti' : 'HT',
    'Heard Island & Mcdonald Islands' : 'HM',
    'Holy See (Vatican City State)' : 'VA',
    'Honduras' : 'HN',
    'Hong Kong' : 'HK',
    'Hungary' : 'HU',
    'Iceland' : 'IS',
    'India' : 'IN',
    'Indonesia' : 'ID',
    'Iran, Islamic Republic Of' : 'IR',
    'Iraq' : 'IQ',
    'Ireland' : 'IE',
    'Isle Of Man' : 'IM',
    'Israel' : 'IL',
    'Italy' : 'IT',
    'Jamaica' : 'JM',
    'Japan' : 'JP',
    'Jersey' : 'JE',
    'Jordan' : 'JO',
    'Kazakhstan' : 'KZ',
    'Kenya' : 'KE',
    'Kiribati' : 'KI',
    'Korea' : 'KR',
    'Kuwait' : 'KW',
    'Kyrgyzstan' : 'KG',
    'Lao People\'s Democratic Republic' : 'LA',
    'Latvia' : 'LV',
    'Lebanon' : 'LB',
    'Lesotho' : 'LS',
    'Liberia' : 'LR',
    'Libyan Arab Jamahiriya' : 'LY',
    'Liechtenstein' : 'LI',
    'Lithuania' : 'LT',
    'Luxembourg' : 'LU',
    'Macao' : 'MO',
    'Macedonia' : 'MK',
    'Madagascar' : 'MG',
    'Malawi' : 'MW',
    'Malaysia' : 'MY',
    'Maldives' : 'MV',
    'Mali' : 'ML',
    'Malta' : 'MT',
    'Marshall Islands' : 'MH',
    'Martinique' : 'MQ',
    'Mauritania' : 'MR',
    'Mauritius' : 'MU',
    'Mayotte' : 'YT',
    'Mexico' : 'MX',
    'Micronesia, Federated States Of' : 'FM',
    'Moldova' : 'MD',
    'Monaco' : 'MC',
    'Mongolia' : 'MN',
    'Montenegro' : 'ME',
    'Montserrat' : 'MS',
    'Morocco' : 'MA',
    'Mozambique' : 'MZ',
    'Myanmar' : 'MM',
    'Namibia' : 'NA',
    'Nauru' : 'NR',
    'Nepal' : 'NP',
    'Netherlands' : 'NL',
    'Netherlands Antilles' : 'AN',
    'New Caledonia' : 'NC',
    'New Zealand' : 'NZ',
    'Nicaragua' : 'NI',
    'Niger' : 'NE',
    'Nigeria' : 'NG',
    'Niue' : 'NU',
    'Norfolk Island' : 'NF',
    'Northern Mariana Islands' : 'MP',
    'Norway' : 'NO',
    'Oman' : 'OM',
    'Pakistan' : 'PK',
    'Palau' : 'PW',
    'Palestinian Territory, Occupied' : 'PS',
    'Panama' : 'PA',
    'Papua New Guinea' : 'PG',
    'Paraguay' : 'PY',
    'Peru' : 'PE',
    'Philippines' : 'PH',
    'Pitcairn' : 'PN',
    'Poland' : 'PL',
    'Portugal' : 'PT',
    'Puerto Rico' : 'PR',
    'Qatar' : 'QA',
    'Reunion' : 'RE',
    'Romania' : 'RO',
    'Russia' : 'RU',
    'Rwanda' : 'RW',
    'Saint Barthelemy' : 'BL',
    'Saint Helena' : 'SH',
    'Saint Kitts And Nevis' : 'KN',
    'Saint Lucia' : 'LC',
    'Saint Martin' : 'MF',
    'Saint Pierre And Miquelon' : 'PM',
    'Saint Vincent And Grenadines' : 'VC',
    'Samoa' : 'WS',
    'San Marino' : 'SM',
    'Sao Tome And Principe' : 'ST',
    'Saudi Arabia' : 'SA',
    'Senegal' : 'SN',
    'Serbia' : 'RS',
    'Seychelles' : 'SC',
    'Sierra Leone' : 'SL',
    'Singapore' : 'SG',
    'Slovakia' : 'SK',
    'Slovenia' : 'SI',
    'Solomon Islands' : 'SB',
    'Somalia' : 'SO',
    'South Africa' : 'ZA',
    'South Georgia And Sandwich Isl.' : 'GS',
    'Spain' : 'ES',
    'Sri Lanka' : 'LK',
    'Sudan' : 'SD',
    'Suriname' : 'SR',
    'Svalbard And Jan Mayen' : 'SJ',
    'Swaziland' : 'SZ',
    'Sweden' : 'SE',
    'Switzerland' : 'CH',
    'Syrian Arab Republic' : 'SY',
    'Taiwan' : 'TW',
    'Tajikistan' : 'TJ',
    'Tanzania' : 'TZ',
    'Thailand' : 'TH',
    'Timor-Leste' : 'TL',
    'Togo' : 'TG',
    'Tokelau' : 'TK',
    'Tonga' : 'TO',
    'Trinidad And Tobago' : 'TT',
    'Tunisia' : 'TN',
    'Turkey' : 'TR',
    'Turkmenistan' : 'TM',
    'Turks And Caicos Islands' : 'TC',
    'Tuvalu' : 'TV',
    'Uganda' : 'UG',
    'Ukraine' : 'UA',
    'United Arab Emirates' : 'AE',
    'United Kingdom' : 'GB',
    'United States of America' : 'US',
    'United States Outlying Islands' : 'UM',
    'Uruguay' : 'UY',
    'Uzbekistan' : 'UZ',
    'Vanuatu' : 'VU',
    'Venezuela' : 'VE',
    'Viet Nam' : 'VN',
    'Virgin Islands, British' : 'VG',
    'Virgin Islands, U.S.' : 'VI',
    'Wallis And Futuna' : 'WF',
    'Western Sahara' : 'EH',
    'Yemen' : 'YE',
    'Zambia' : 'ZM',
    'Zimbabwe' : 'ZW'
    }

    return codes[country].toLowerCase();
}

function getCountryPopulation(country){
    var population = {
        'Aruba'	: 105000,
        'Afghanistan':	35530000,
        'Angola':	29784000,
        'Albania':	2879000,
        'Andorra':	77000,
        'Arab World':	414481000,
        'United Arab Emirates':	9400000,
        'Argentina':	44271000,
        'Armenia':	2930000,
        'American Samoa' :	56000,
        'Antigua and Barbuda':	102000,
        'Australia':	24446000,
        'Azerbaijan':	9868000,
        'Austria':	8770000,
        'Azerbaijan':	9868000,
        'Burundi':	10864000,
        'Belgium':	11416000,
        'Benin':	11176000,
        'Burkina Faso':	19193000,
        'Bangladesh':	164670000,
        'Bulgaria':	7075000,
        'Bahrain':	1493000,
        'Bahamas':	395000,
        'Bosnia and Herzegovina':	3507000,
        'Belarus':	9480000,
        'Belize':	375000,
        'Bolivia':	11052000,
        'Brazil':	209288000,
        'Barbados':	286000,
        'Brunei Darussalam':	429000,
        'Bhutan':	808000,
        'Botswana':	2292000,
        'Central African Republic':	4659000,
        'Canada':	36613000,
        'Central Europe and the Baltics':	102696000,
        'Switzerland':	8441000,
        'Channel Islands':	165000,
        'Chile':	18055000,
        'China':	1383981000,
        'Cote dIvoire':	24295000,
        'Cameroon':	24054000,
        'Congo, Dem. Rep.':	81340000,
        'Congo, Rep.':	5261000,
        'Colombia':	49066000,
        'Comoros':	814000,
        'Cabo Verde':	546000,
        'Costa Rica':	4906000,
        'Caribbean small states':	7284000,
        'Cuba':	11485000,
        'Curacao':	161000,
        'Cayman Islands':	62000,
        'Cyprus':	1180000,
        'Czech Republic':	10571000,
        'Germany':	82581000,
        'Djibouti':	957000,
        'Dominica':	74000,
        'Denmark':	5751000,
        'Dominican Republic':	10767000,
        'Algeria':	41318000,
        'Egypt':	97553000,
        'Spain':	46460000,
        'Estonia':	1313000,
        'Ethiopia':	104957000,
        'Finland':	5510000,
        'Fiji':	906000,
        'France':	67143000,
        'United Kingdom':	66013000,
        'Georgia':	3715000,
        'Ghana':	28834000,
        'Guinea':	12717000,
        'Greece':	10726000,
        'Grenada':	108000,
        'Guatemala':	16914000,
        'Croatia':	4155000,
        'Haiti':	10981000,
        'Hungary':	9785000,
        'Indonesia':	263991000,
        'India':	1339180000,
        'Ireland':	4815000,
        'Iran':	81163000,
        'Iraq':	38275000,
        'Iceland':	337000,
        'Israel':	8682000,
        'Italy':	60570000,
        'Jamaica':	2890000,
        'Jordan':	9702000,
        'Japan':	126641000,
        'Kazakhstan':	17996000,
        'Kenya':	49700000,
        'Kuwait':	4137000,
        'Lebanon':	6082000,
        'Liberia':	4732000,
        'Libya':	6375000,
        'Sri Lanka':	21302000,
        'Lithuania':	2856000,
        'Luxembourg':	590000,
        'Latvia':	1950000,
        'Morocco':	35740000,
        'Moldova':	3544000,
        'Madagascar':	25571000,
        'Maldives':	423000,
        'Mexico':	129163000,
        'Macedonia':	2083000,
        'Mali':	18542000,
        'Malta':	439000,
        'Niger':	21477000,
        'Nigeria':	190886000,
        'Nicaragua':	6218000,
        'Netherlands':	17073000,
        'Norway':	5289000,
        'Nepal':	29305000,
        'New Zealand':	4736000,
        'Oman':	4636000,
        'Pakistan':	197016000,
        'Panama':	4099000,
        'Peru':	32165000,
        'Philippines':	104918000,
        'Palau':	22000,
        'Papua New Guinea':	8251000,
        'Poland':	37908000,
        'Puerto Rico':	3410000,
        'Korea':	25491000,
        'Portugal':	10286000,
        'Paraguay':	6811000,
        'West Bank and Gaza':	4674000,
        'Qatar':	2639000,
        'Romania':	19586000,
        'Russia':	144231000,
        'Rwanda':	12208000,
        'Saudi Arabia':	32938000,
        'Sudan':	40533000,
        'Senegal':	15851000,
        'Singapore':	5688000,
        'Sierra Leone':	7557000,
        'Somalia':	14743000,
        'Slovenia':	2066000,
        'Sweden':9971000,
        'Syria':	18270000,
        'Thailand':	69038000,
        'Tajikistan':	8921000,
        'Turkmenistan':	5758000,
        'Tunisia':	11532000,
        'Turkey':	80745000,
        'Tanzania':	57310000,
        'Uganda':	42863000,
        'Ukraine':	44776000,
        'Uruguay':	3457000,
        'United States of America':	325524000,
        'Uzbekistan':	32262000,
        'Venezuela': 31977000,
        'Vietnam':	93652000,
        'Yemen': 28250000,
        'South Africa':	56639000,
        'Zimbabwe':	16530000
    }

    return population[country];
}