const ejs = require("ejs");
const pdf = require("html-pdf");
const intl = require("intl");

// const pdfOptions = {
//   footer: {
//     height: "65mm",
//     contents: `
//       <table style="width:100%; font-family: -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif;">
//         <tr>
//         <td style="text-align:right; padding: 0 25px;">
//           <div style="font-weight:500; font-size:11px; letter-spacing: 0.07em;">
//             For PVKL Tech Services <br> 
//             <span style="display:inline-block; margin-right:5px;">Private Limted</span>
//           </div>
//           <div style="padding: 6px 0;">
//             <img src="https://provakil.com/images/signature-1.png"
//                  width="120"
//                  style="max-width: 150px; height: auto;" />
//           </div>
//           <div style="font-weight:500; font-size:11px; line-height:1.2; letter-spacing: 0.07em;">
//             Authorised Signatory
//           </div>
//         </td>
//         </tr>
//         <tr>
//         <td style="text-align:center; padding-top: 12px; font-size:12px;">
//           <i>For any queries, please contact us at help@provakil.com or call us at 1800-547-0300</i>
//         </td>
//       </tr>
//       </table>
//     `
//   }
// };

function _wholeAmountInWords(amount) {
  // Copied from https://www.finotax.com/misc/rs-in-words
  var words = new Array();
  words[0] = "Zero";
  words[1] = "One";
  words[2] = "Two";
  words[3] = "Three";
  words[4] = "Four";
  words[5] = "Five";
  words[6] = "Six";
  words[7] = "Seven";
  words[8] = "Eight";
  words[9] = "Nine";
  words[10] = "Ten";
  words[11] = "Eleven";
  words[12] = "Twelve";
  words[13] = "Thirteen";
  words[14] = "Fourteen";
  words[15] = "Fifteen";
  words[16] = "Sixteen";
  words[17] = "Seventeen";
  words[18] = "Eighteen";
  words[19] = "Nineteen";
  words[20] = "Twenty";
  words[30] = "Thirty";
  words[40] = "Forty";
  words[50] = "Fifty";
  words[60] = "Sixty";
  words[70] = "Seventy";
  words[80] = "Eighty";
  words[90] = "Ninety";
  amount = amount.toString();
  var atemp = amount.split(".");
  var number = atemp[0].split(",").join("");
  var n_length = number.length;
  var words_string = "";
  if (n_length <= 9) {
    var n_array = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
    var received_n_array = new Array();
    for (var i = 0; i < n_length; i++) {
      received_n_array[i] = number.substr(i, 1);
    }
    for (var i = 9 - n_length, j = 0; i < 9; i++, j++) {
      n_array[i] = received_n_array[j];
    }
    for (var i = 0, j = 1; i < 9; i++, j++) {
      if (i == 0 || i == 2 || i == 4 || i == 7) {
        if (n_array[i] == 1) {
          n_array[j] = 10 + parseInt(n_array[j]);
          n_array[i] = 0;
        }
      }
    }
    var value = "";
    for (var i = 0; i < 9; i++) {
      if (i == 0 || i == 2 || i == 4 || i == 7) {
        value = n_array[i] * 10;
      } else {
        value = n_array[i];
      }
      if (value != 0) {
        words_string += words[value] + " ";
      }
      if (
        (i == 1 && value != 0) ||
        (i == 0 && value != 0 && n_array[i + 1] == 0)
      ) {
        words_string += "Crore";
        if (n_array[i - 1] * 10 + Number(n_array[i]) > 1) {
          words_string += "s";
        }
        words_string += " ";
      }
      if (
        (i == 3 && value != 0) ||
        (i == 2 && value != 0 && n_array[i + 1] == 0)
      ) {
        words_string += "Lakh";
        if (n_array[i - 1] * 10 + Number(n_array[i]) > 1) {
          words_string += "s";
        }
        words_string += " ";
      }
      if (
        (i == 5 && value != 0) ||
        (i == 4 && value != 0 && n_array[i + 1] == 0)
      ) {
        words_string += "Thousand ";
      }
      if (i == 6 && value != 0 && n_array[i + 1] != 0 && n_array[i + 2] != 0) {
        words_string += "Hundred and ";
      } else if (i == 6 && value != 0) {
        words_string += "Hundred ";
      }
    }
    words_string = words_string.split(" ").join(" ");
  }
  return words_string.trim();
}

const amountInWordsFormatter = {
  amountInWords: function (n, otherCurrency) {
    var nums = n.toString().split(".");
    var whole = _wholeAmountInWords(nums[0]);
    if (nums[1] == null) nums[1] = 0;
    if (nums[1].length == 1) nums[1] = nums[1] + "0";
    if (nums[1].length > 2) {
      nums[1] = nums[1].substring(2, nums[1].length - 1);
    }
    var op = "";
    if (nums.length == 2) {
      if (nums[0] <= 9) {
        nums[0] = nums[0] * 10;
      } else {
        nums[0] = nums[0];
      }
      var fraction = _wholeAmountInWords(nums[1]);
      if (whole == "" && fraction == "") {
        op = "Zero";
      }
      if (whole == "" && fraction != "") {
        op = fraction;
        if (!otherCurrency) {
          op += " Paise";
        }
      }
      if (whole != "" && fraction == "") {
        if (!otherCurrency) {
          op = "Rupees ";
        }
        op += whole;
      }
      if (whole != "" && fraction != "") {
        if (!otherCurrency) {
          op = "Rupees ";
        }
        op += whole + " and " + fraction;
        if (!otherCurrency) {
          op += " Paise";
        }
      }
      var amt = n;
      if (amt > 999999999.99) {
        op = "Oops!!! The amount is too big to convert";
      }
      if (isNaN(amt) == true) {
        op = "Error : Amount in number appears to be incorrect. Please Check.";
      }
      var regexToCheck = new RegExp("^Zero", "i");
      var amtInWords = op.trim();
      if (amtInWords.match(regexToCheck)) {
        amtInWords = "Rupees " + op.trim();
      }
      return amtInWords;
    }
  },
};

function currencyInReadableFormat(
  value,
  locale,
  currencyType,
  withoutcurrencySymbol = false
) {
  if (typeof locale === "undefined") {
    locale = "en-IN";
  }
  if (typeof currencyType === "undefined") {
    currencyType = "INR";
  }
  var formatedAmount = intl
    .NumberFormat(locale, { style: "currency", currency: currencyType })
    .format(value);
  var regex = new RegExp("([^\\d]+)(\\d[\\d\\.\\,]+)", "i");
  var match = formatedAmount.match(regex);
  if (match && match[0] === formatedAmount) {
    formatedAmount = match[1].trim() + " " + match[2].trim();
  }
  if (withoutcurrencySymbol) {
    var currencySymbol = new RegExp("([^\\d,.-]+)", "i");
    formatedAmount = formatedAmount.replace(currencySymbol, "").trim();
  }
  return formatedAmount;
}

const data = {
  amountInWordsFormatter,
  readableAmountData: currencyInReadableFormat,
  caseDetails: {
    forum: undefined,
    id: '658acaa95e7de80e24331e6a',
    case_type_id_yr: 'Civil Reference 123/2021',
    petitioner: 'CHAGANBHAI PATHUBHAI MAHALIYA ALIAS HARIJAN',
    respondent: 'S STATE OF GUJARAT',
    case_type: undefined,
    case_id: undefined,
    case_year: undefined,
    case_object_id: '5ca6eea15362653001c2b3e2',
    fileNum: 'GP78',
    nextDate: 'December 28th 2023',
    isDisposed: false,
    listingDate: 'September 4th 2024',
    caseTitle: 'CHAGANBHAI PATHUBHAI MAHALIYA ALIAS HARIJAN V/s S STATE OF GUJARAT',
    matterCode: 'GP78',
    subscribers: [],
    customFields: {
      basic_details_1674120861677_type_of_case_1690981917087: '0',
      basic_details_1674120861677_department_1674120883428: '0',
      basic_details_1674120861677_summary_1674120871604_history: [Array],
      basic_details_1674120861677_department_1674120883428_history: [Array]
    },
    rates: []
  },
  // caseDetails: {
  //   forum: 'Bombay High Court',
  //   id: '659e74666874995d4d09170a',
  //   case_type_id_yr: 'Civil Reference 123/2021',
  //   petitioner: undefined,
  //   respondent: undefined,
  //   case_type: 'Civil Reference',
  //   case_id: '123',
  //   case_year: 2021,
  //   case_object_id: '659e74666874995d4d091707',
  //   fileNum: '1',
  //   nextDate: 'June 19th 2024',
  //   isDisposed: false,
  //   listingDate: 'July 29th 2024',
  //   caseTitle: 'Not Available',
  //   matterCode: '1',
  //   subscribers: [ '657aaa788fe825aab769218b' ],
  //   customFields: {},
  //   rates: []
  // },
  // caseDetails: {
  //   forum: undefined,
  //   id: '66c701dec1b4adf158e9b352',
  //   case_type_id_yr: undefined,
  //   petitioner: 'Surendra Kumar',
  //   respondent: 'The District Collector Churu And Ors.',
  //   case_type: undefined,
  //   case_id: undefined,
  //   case_year: undefined,
  //   case_object_id: '61c1a60e2ad6e4a517293bf9',
  //   fileNum: '1',
  //   isDisposed: false,
  //   listingDate: 'August 28th 2024',
  //   caseTitle: 'Surendra Kumar V/s The District Collector Churu And Ors.',
  //   matterCode: '1',
  //   subscribers: [ '657aaa788fe825aab769218b' ],
  //   customFields: {},
  //   rates: []
  // },
  currencyType: {
    name: "INR",
    value: "INR",
    hexCode: "&#8377;",
    fontIcon: "fas fa-rupee-sign",
    locale: "en-IN",
  },
  invoicePayment: { paymentsInfo: [], totalAmount: 0, totalTax: 0 },
  custom_info: "",
  // pocket_expenses_original: 500,
  pocket_expenses: "3,972",
  pocket_expense_key: "Out-of-pocket expenses",
  advancePayment:2500,
  pocket_expenses_tax: null,
  invoice_num: "2024-08/2",
  invoice_date: 'November 24, 2024',
  due_date: "February 21, 2024",
  total_amount: "14,73,354",
  total_amount_original: 12500,
  total_amount_in_words: "Rupees Twelve Thousand Five Hundred",
  out_of_pocket: 0,
  amount_payable: 0,
  amount_payable_in_words: "Rupees Zero",
  total_amount_payable: 22000,
  total_amount_payable_in_words:
    "Twenty Two Thousand",
  total_tax: undefined,
  sub_total: 11222222000,
  stateCode: undefined,
  state: "",
  client: {
    name: 'Sudeep Goswami',
    company: 'Cyqure India Private Limited',
    salutation: 'Mr. ',
    address: {
      street: 'G Block, BKC, Bandra (E)',
      city: 'Mumbai',
      district: 'Pune',
      state: 'Maharashtra',
      pincode: '400051',
      country: 'India',
      building: 'Plot No. C-21, Tower C',
    },
    custom: [ {} ],
    email: undefined,
    gstin: ''
  },
  companyAddress: {
    street: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    country: '',
    building: ''
  },
  clientCustomFields: {
    title: {
      resource: "client",
      displayName: "Designation",
      type: "string",
      visibility: [Object],
      location: [Object],
      style: [Object],
      modify: true,
      group: "basic_details_group",
      key: "title",
      category: [Array],
      dontShowInExcelImport: false,
      requiredConditions: [],
      modifyConditions: [],
      removeConditions: [],
      order: 1,
      documentDelete: true,
      finalstyle: "",
      actions: false,
      dependantFields: [],
      groupKey: "basic_details_group_title",
      valueToShow: "",
    },
  },
  companyCustomFields: {
    category_1703051394334: {
      displayName: "Category",
      key: "category_1703051394334",
      type: "string",
      group: "extra_details_1703051378699",
      order: 1,
      resource: "companies",
      modify: true,
      location: [Object],
      style: [Object],
      requiredConditions: [],
      modifyConditions: [],
      removeConditions: [],
      documentDelete: true,
      finalstyle: "",
      actions: false,
      dependantFields: [],
      groupKey: "extra_details_1703051378699_category_1703051394334",
      valueToShow: "",
    },
    industry_1703051400994: {
      displayName: "Industry",
      key: "industry_1703051400994",
      type: "string",
      group: "extra_details_1703051378699",
      order: 2,
      resource: "companies",
      modify: true,
      location: [Object],
      style: [Object],
      requiredConditions: [],
      modifyConditions: [],
      removeConditions: [],
      documentDelete: true,
      finalstyle: "",
      actions: false,
      dependantFields: [],
      groupKey: "extra_details_1703051378699_industry_1703051400994",
      valueToShow: "",
    },
    referred_by_1703051407877: {
      displayName: "Referred by",
      key: "referred_by_1703051407877",
      type: "string",
      group: "extra_details_1703051378699",
      order: 3,
      resource: "companies",
      modify: true,
      location: [Object],
      style: [Object],
      requiredConditions: [],
      modifyConditions: [],
      removeConditions: [],
      documentDelete: true,
      finalstyle: "",
      actions: false,
      dependantFields: [],
      groupKey: "extra_details_1703051378699_referred_by_1703051407877",
      valueToShow: "",
    },
    productservices_1703051413868: {
      displayName: "Product/Services",
      key: "productservices_1703051413868",
      type: "string",
      group: "extra_details_1703051378699",
      order: 4,
      resource: "companies",
      modify: true,
      location: [Object],
      style: [Object],
      requiredConditions: [],
      modifyConditions: [],
      removeConditions: [],
      documentDelete: true,
      finalstyle: "",
      actions: false,
      dependantFields: [],
      groupKey: "extra_details_1703051378699_productservices_1703051413868",
      valueToShow: "",
    },
    nature_of_relation_1703051421984: {
      displayName: "Nature of Relation",
      key: "nature_of_relation_1703051421984",
      type: "string",
      group: "extra_details_1703051378699",
      order: 5,
      resource: "companies",
      modify: true,
      location: [Object],
      style: [Object],
      requiredConditions: [],
      modifyConditions: [],
      removeConditions: [],
      documentDelete: true,
      finalstyle: "",
      actions: false,
      dependantFields: [],
      groupKey: "extra_details_1703051378699_nature_of_relation_1703051421984",
      valueToShow: "",
    },
    telephone_no_1703051434459: {
      displayName: "Telephone No.",
      key: "telephone_no_1703051434459",
      type: "string",
      group: "extra_details_1703051378699",
      order: 6,
      resource: "companies",
      modify: true,
      location: [Object],
      style: [Object],
      requiredConditions: [],
      modifyConditions: [],
      removeConditions: [],
      documentDelete: true,
      finalstyle: "",
      actions: false,
      dependantFields: [],
      groupKey: "extra_details_1703051378699_telephone_no_1703051434459",
      valueToShow: "",
    },
  },
  expenses: [],
  user: {
    name: "Provakil",
    contact: "0000000000",
    email: "provakil@provakil.com",
  },
  // projectDetails: {
  //   matterName: "Lorem ipsum dolor sit, amet consectetur adipisicing elit.",
  //   matterCode: "2024/2/T",
  // },
  projectDetails: { matterName: undefined, matterCode: '' },
  surCharges: [
    {
      type: 'clerkage',
      rate: 10,
      amount: 100,
      lineItem: 'Clerkage @10%',
      addAsTotalAmount: false
    },
    {
      type: 'clerkage_amount',
      rate: 420,
      amount: 420,
      lineItem: 'Clerkage',
      addAsTotalAmount: false,
      direct_amount: true
    }
  ],
  surChargesKeyBy: {
    clerkage: {
      type: "clerkage",
      rate: 10,
      amount: 1000,
      lineItem: "Clerkage @10%",
      addAsTotalAmount: false,
    },
    clerkage_amount: {
      type: "clerkage_amount",
      rate: 10000,
      amount: 10000,
      lineItem: "Clerkage",
      addAsTotalAmount: false,
      direct_amount: true,
    },
    discount: {
      type: "discount",
      rate: 5,
      amount: -1050,
      lineItem: "Discount @5%",
      addAsTotalAmount: false,
    },
    partner_discount: {
      type: "partner_discount",
      rate: 5,
      amount: -5,
      lineItem: "Partners Discount",
      addAsTotalAmount: false,
      direct_amount: true,
    },
  },
  // customFields: {
  //   period_from: {
  //     type: "date",
  //     displayName: "Period From",
  //     location: [Object],
  //     style: [Object],
  //     modify: false,
  //     group: "invoice_details",
  //     key: "period_from",
  //     dateFormatToUse: "MMMM D, YYYY",
  //     documentDelete: true,
  //     value: "2024-10-03T00:00:00.000Z",
  //     finalstyle: "",
  //     actions: false,
  //     groupKey: "invoice_details_period_from",
  //     valueToShow: "September 3, 2024",
  //   },
  //   period_to: {
  //     type: "date",
  //     displayName: "Period To",
  //     location: [Object],
  //     style: [Object],
  //     modify: false,
  //     group: "invoice_details",
  //     key: "period_to",
  //     dateFormatToUse: "MMMM D, YYYY",
  //     documentDelete: true,
  //     value: "2024-10-18T00:00:00.000Z",
  //     finalstyle: "",
  //     actions: false,
  //     groupKey: "invoice_details_period_to",
  //     valueToShow: "September 18, 2024",
  //   },
  //   subject: {
  //     type: "string",
  //     displayName: "Subject",
  //     location: [Object],
  //     style: [Object],
  //     modify: false,
  //     group: "invoice_details",
  //     key: "subject",
  //     documentDelete: true,
  //     finalstyle: "",
  //     actions: false,
  //     groupKey: "invoice_details_subject",
  //     valueToShow: "In the matter of proceedings initiated by SEBI against Mr.Malvinder Singh and his associated companies",
  //   },
  //   invoice_prefix: {
  //     type: "string",
  //     displayName: "Bill Number Prefix",
  //     location: [Object],
  //     style: [Object],
  //     modify: false,
  //     group: "invoice_details",
  //     key: "invoice_prefix",
  //     documentDelete: true,
  //     finalstyle: "",
  //     actions: false,
  //     groupKey: "invoice_details_invoice_prefix",
  //     valueToShow: "",
  //   },
  //   matter_attended: {
  //     type: "collection",
  //     displayName: "Matter Attended By",
  //     location: [Object],
  //     style: [Object],
  //     modify: false,
  //     group: "invoice_details",
  //     key: "matter_attended",
  //     collectionType: "user",
  //     fetchOptions: [Object],
  //     isSortable: true,
  //     documentDelete: true,
  //     finalstyle: "",
  //     url: "users?collectionField=true",
  //     searchable: true,
  //     actions: false,
  //     groupKey: "invoice_details_matter_attended",
  //     valueToShow: "Ravichandra Hegde, Paras Parekh,Parinaz Bharucha, Samyak Pati, Mr. Kandarp Trivedi, Riya Gokalgandhi",
  //   },
  //   gst_notification: {
  //     type: "longstring",
  //     displayName: "GST Notification",
  //     location: [Object],
  //     style: [Object],
  //     modify: false,
  //     group: "invoice_details",
  //     key: "gst_notification",
  //     documentDelete: true,
  //     finalstyle: "",
  //     actions: false,
  //     groupKey: "invoice_details_gst_notification",
  //     valueToShow: "",
  //   },
  //   show_logo: {
  //     type: "enum",
  //     displayName: "Show logo",
  //     location: [Object],
  //     style: [Object],
  //     modify: false,
  //     group: "invoice_details",
  //     key: "show_logo",
  //     values: [Array],
  //     documentDelete: true,
  //     value: "1",
  //     finalstyle: "",
  //     actions: false,
  //     groupKey: "invoice_details_show_logo",
  //     valueToShow: "Yes",
  //   },
  //   show_signature: {
  //     type: "enum",
  //     displayName: "Show Signature",
  //     location: [Object],
  //     style: [Object],
  //     modify: false,
  //     group: "invoice_details",
  //     key: "show_signature",
  //     values: [Array],
  //     documentDelete: true,
  //     value: "1",
  //     finalstyle: "",
  //     actions: false,
  //     groupKey: "invoice_details_show_signature",
  //     valueToShow: "Yes",
  //   },
  // },
  usercaseDetails: { matterName: "Ansaldo Signal Consortium & Ors. V/s North Central Railway Project Unit" },
  // allUsercasesKeyed: {
  //   '659e74666874995d4d09170a': {
  //     forum: 'Bombay High Court',
  //     id: '659e74666874995d4d09170a',
  //     case_type_id_yr: 'Civil Reference 123/2021',
  //     petitioner: undefined,
  //     respondent: undefined,
  //     case_type: 'Civil Reference',
  //     case_id: '123',
  //     case_year: 2021,
  //     case_object_id: '659e74666874995d4d091707',
  //     fileNum: 'GP78',
  //     nextDate: 'June 19th 2024',
  //     isDisposed: false,
  //     listingDate: 'July 29th 2024',
  //     caseTitle: 'Not Available',
  //     matterCode: 'GP78',
  //     subscribers: [Array],
  //     customFields: {},
  //     rates: []
  //   }
  // },
  customFields: {
    // dispatch_number: {
    //   type: 'string',
    //   displayName: 'Accounts Dispatch Number',
    //   location: [Object],
    //   style: [Object],
    //   modify: false,
    //   group: 'invoice_details',
    //   key: 'dispatch_number',
    //   documentDelete: true,
    //   value: 'dispatch',
    //   finalstyle: '',
    //   actions: false,
    //   groupKey: 'invoice_details_dispatch_number',
    //   valueToShow: 'dispatch'
    // },
    follow_up_name_user: {
      type: 'collection',
      displayName: 'Follow up name',
      location: [Object],
      style: [Object],
      modify: false,
      group: 'invoice_details',
      key: 'follow_up_name_user',
      collectionType: 'user',
      fetchOptions: [Object],
      isSortable: true,
      documentDelete: true,
      value: '[{"id":"5bc80aaa1a541f68eea9aa0d","name":"Mr. Ankit Sinha"}]',
      finalstyle: '',
      url: 'users?collectionField=true',
      searchable: true,
      actions: false,
      groupKey: 'invoice_details_follow_up_name_user',
      valueToShow: 'Mr. Ankit Sinha'
    },
    subject: {
      type: 'string',
      displayName: 'Subject',
      location: [Object],
      style: [Object],
      modify: false,
      group: 'invoice_details',
      key: 'subject',
      documentDelete: true,
      value: 'Professional fees for legal services rendered in relation to the listing of the nonconvertible debentures for Cyqure India Private Limited.',
      finalstyle: '',
      actions: false,
      groupKey: 'invoice_details_subject',
      valueToShow: 'Professional fees for legal services rendered in relation to the listing of the nonconvertible debentures for Cyqure India Private Limited.'
    },
    // period_from: {
    //   type: 'date',
    //   displayName: 'Period From',
    //   location: [Object],
    //   style: [Object],
    //   modify: false,
    //   group: 'invoice_details',
    //   key: 'period_from',
    //   documentDelete: true,
    //   value: '2024-09-10T00:00:00.000Z',
    //   finalstyle: '',
    //   actions: false,
    //   groupKey: 'invoice_details_period_from',
    //   valueToShow: '10th September 2024'
    // },
    // period_to: {
    //   type: 'date',
    //   displayName: 'Period To',
    //   location: [Object],
    //   style: [Object],
    //   modify: false,
    //   group: 'invoice_details',
    //   key: 'period_to',
    //   documentDelete: true,
    //   value: '2024-09-11T00:00:00.000Z',
    //   finalstyle: '',
    //   actions: false,
    //   groupKey: 'invoice_details_period_to',
    //   valueToShow: '11th September 2024'
    // },
    sign_to_show: {
      type: 'enum',
      displayName: 'Authorised Signatory',
      location: [Object],
      style: [Object],
      modify: false,
      group: 'invoice_details',
      key: 'sign_to_show',
      values: [Array],
      documentDelete: true,
      value: '1',
      finalstyle: '',
      actions: false,
      groupKey: 'invoice_details_sign_to_show',
      valueToShow: 'Mr. Kiran'
    },
    bank_details: {
      type: 'enum',
      displayName: 'Bank Details',
      location: [Object],
      style: [Object],
      modify: false,
      group: 'invoice_details',
      key: 'bank_details',
      values: [Array],
      documentDelete: true,
      value: '2',
      finalstyle: '',
      actions: false,
      groupKey: 'invoice_details_bank_details',
      valueToShow: 'DBS'
    },
    bill_no_type: {
      type: 'enum',
      displayName: 'Select Bill Type',
      location: [Object],
      style: [Object],
      modify: false,
      group: 'invoice_details',
      key: 'bill_no_type',
      values: [Array],
      documentDelete: true,
      value: '1',
      finalstyle: '',
      actions: false,
      groupKey: 'invoice_details_bill_no_type',
      valueToShow: 'ORIGINAL'
    },
    // purchase_order_number: {
    //   type: 'string',
    //   displayName: 'Purchase Order No.',
    //   location: [Object],
    //   style: [Object],
    //   modify: false,
    //   group: 'invoice_details',
    //   key: 'purchase_order_number',
    //   documentDelete: true,
    //   value: 'order no test',
    //   finalstyle: '',
    //   actions: false,
    //   groupKey: 'invoice_details_purchase_order_number',
    //   valueToShow: 'order no test'
    // },
    // matter_id: {
    //   type: 'multientry',
    //   displayName: 'Matter ID',
    //   location: [Object],
    //   style: [Object],
    //   modify: false,
    //   group: 'invoice_details',
    //   key: 'matter_id',
    //   documentDelete: true,
    //   value: '["mater id 2"]',
    //   finalstyle: '',
    //   actions: false,
    //   groupKey: 'invoice_details_matter_id',
    //   valueToShow: 'mater id 2'
    // },
    lmn_number: {
      type: 'string',
      displayName: 'LMN No.',
      location: [Object],
      style: [Object],
      modify: false,
      group: 'invoice_details',
      key: 'lmn_number',
      documentDelete: true,
      finalstyle: '',
      actions: false,
      groupKey: 'invoice_details_lmn_number',
      valueToShow: ''
    },
    so_number: {
      type: 'string',
      displayName: 'SO No.',
      location: [Object],
      style: [Object],
      modify: false,
      group: 'invoice_details',
      key: 'so_number',
      documentDelete: true,
      finalstyle: '',
      actions: false,
      groupKey: 'invoice_details_so_number',
      valueToShow: ''
    },
    // so_date: {
    //   type: 'date',
    //   displayName: 'SO Date',
    //   location: [Object],
    //   style: [Object],
    //   modify: false,
    //   group: 'invoice_details',
    //   key: 'so_date',
    //   documentDelete: true,
    //   value: '2024-09-12T00:00:00.000Z',
    //   finalstyle: '',
    //   actions: false,
    //   groupKey: 'invoice_details_so_date',
    //   valueToShow: '12th September 2024'
    // },
    matter_attended: {
      type: 'string',
      displayName: 'Matter Attended By',
      location: [Object],
      style: [Object],
      modify: false,
      group: 'invoice_details',
      key: 'matter_attended',
      documentDelete: true,
      value: 'attended',
      finalstyle: '',
      actions: false,
      groupKey: 'invoice_details_matter_attended',
      valueToShow: 'attended'
    },
    attn: {
      type: 'string',
      displayName: 'Attn',
      location: [Object],
      style: [Object],
      modify: false,
      group: 'invoice_details',
      key: 'attn',
      documentDelete: true,
      finalstyle: '',
      actions: false,
      groupKey: 'invoice_details_attn',
      valueToShow: ''
    },
    bill_number: {
      type: 'string',
      displayName: 'Bill Number',
      location: [Object],
      style: [Object],
      modify: false,
      group: 'invoice_details',
      key: 'bill_number',
      documentDelete: true,
      finalstyle: '',
      actions: false,
      groupKey: 'invoice_details_bill_number',
      valueToShow: ''
    },
    bill_to: {
      type: 'string',
      displayName: 'Bill To',
      location: [Object],
      style: [Object],
      modify: false,
      group: 'invoice_details',
      key: 'bill_to',
      documentDelete: true,
      finalstyle: '',
      actions: false,
      groupKey: 'invoice_details_bill_to',
      valueToShow: ''
    },
    date_on_bill: {
      type: 'date',
      displayName: 'Date on Bill',
      location: [Object],
      style: [Object],
      modify: false,
      group: 'invoice_details',
      key: 'date_on_bill',
      documentDelete: true,
      value: '2024-09-13T00:00:00.000Z',
      finalstyle: '',
      actions: false,
      groupKey: 'invoice_details_date_on_bill',
      valueToShow: '13th September 2024'
    },
    // due_date_on_bill: {
    //   type: 'date',
    //   displayName: 'Due Date on Bill',
    //   location: [Object],
    //   style: [Object],
    //   modify: false,
    //   group: 'invoice_details',
    //   key: 'due_date_on_bill',
    //   documentDelete: true,
    //   value: '2024-09-14T00:00:00.000Z',
    //   finalstyle: '',
    //   actions: false,
    //   groupKey: 'invoice_details_due_date_on_bill',
    //   valueToShow: '14th September 2024'
    // },
    gstin: {
      type: 'string',
      displayName: 'GSTIN',
      location: [Object],
      style: [Object],
      modify: false,
      group: 'invoice_details',
      key: 'gstin',
      documentDelete: true,
      finalstyle: '',
      actions: false,
      groupKey: 'invoice_details_gstin',
      valueToShow: ''
    },
    bill_from: {
      type: 'date',
      displayName: 'Bill From',
      location: [Object],
      style: [Object],
      modify: false,
      group: 'invoice_details',
      key: 'bill_from',
      documentDelete: true,
      value: '2024-09-15T00:00:00.000Z',
      finalstyle: '',
      actions: false,
      groupKey: 'invoice_details_bill_from',
      valueToShow: '15th September 2024'
    },
    bill_date_to: {
      type: 'date',
      displayName: 'Bill To',
      location: [Object],
      style: [Object],
      modify: false,
      group: 'invoice_details',
      key: 'bill_date_to',
      documentDelete: true,
      value: '2024-09-16T00:00:00.000Z',
      finalstyle: '',
      actions: false,
      groupKey: 'invoice_details_bill_date_to',
      valueToShow: '16th September 2024'
    },
    attended_by_a: {
      type: 'string',
      displayName: 'Attended By for (A)',
      location: [Object],
      style: [Object],
      modify: false,
      group: 'invoice_details',
      key: 'attended_by_a',
      documentDelete: true,
      value: 'for a',
      finalstyle: '',
      actions: false,
      groupKey: 'invoice_details_attended_by_a',
      valueToShow: 'for a'
    },
    hours_logged_a: {
      type: 'string',
      displayName: 'Hours Logged for (A)',
      location: [Object],
      style: [Object],
      modify: false,
      group: 'invoice_details',
      key: 'hours_logged_a',
      documentDelete: true,
      value: '4',
      finalstyle: '',
      actions: false,
      groupKey: 'invoice_details_hours_logged_a',
      valueToShow: '4'
    },
    cost_per_hour_a: {
      type: 'string',
      displayName: 'US$ per Hr for (A)',
      location: [Object],
      style: [Object],
      modify: false,
      group: 'invoice_details',
      key: 'cost_per_hour_a',
      documentDelete: true,
      value: '4',
      finalstyle: '',
      actions: false,
      groupKey: 'invoice_details_cost_per_hour_a',
      valueToShow: '4'
    },
    attended_by_b: {
      type: 'string',
      displayName: 'Attended By for (B)',
      location: [Object],
      style: [Object],
      modify: false,
      group: 'invoice_details',
      key: 'attended_by_b',
      documentDelete: true,
      value: '3',
      finalstyle: '',
      actions: false,
      groupKey: 'invoice_details_attended_by_b',
      valueToShow: '3'
    },
    hours_logged_b: {
      type: 'string',
      displayName: 'Hours Logged for (B)',
      location: [Object],
      style: [Object],
      modify: false,
      group: 'invoice_details',
      key: 'hours_logged_b',
      documentDelete: true,
      value: 'b',
      finalstyle: '',
      actions: false,
      groupKey: 'invoice_details_hours_logged_b',
      valueToShow: 'b'
    },
    cost_per_hour_b: {
      type: 'string',
      displayName: 'US$ per Hr for (B)',
      location: [Object],
      style: [Object],
      modify: false,
      group: 'invoice_details',
      key: 'cost_per_hour_b',
      documentDelete: true,
      value: '33',
      finalstyle: '',
      actions: false,
      groupKey: 'invoice_details_cost_per_hour_b',
      valueToShow: '33'
    },
    attended_by_c: {
      type: 'string',
      displayName: 'Attended By for (C)',
      location: [Object],
      style: [Object],
      modify: false,
      group: 'invoice_details',
      key: 'attended_by_c',
      documentDelete: true,
      value: '3',
      finalstyle: '',
      actions: false,
      groupKey: 'invoice_details_attended_by_c',
      valueToShow: '3'
    },
    hours_logged_c: {
      type: 'string',
      displayName: 'Hours Logged for (C)',
      location: [Object],
      style: [Object],
      modify: false,
      group: 'invoice_details',
      key: 'hours_logged_c',
      documentDelete: true,
      value: '4',
      finalstyle: '',
      actions: false,
      groupKey: 'invoice_details_hours_logged_c',
      valueToShow: '4'
    },
    cost_per_hour_c: {
      type: 'string',
      displayName: 'US$ per Hr for (C)',
      location: [Object],
      style: [Object],
      modify: false,
      group: 'invoice_details',
      key: 'cost_per_hour_c',
      documentDelete: true,
      value: '32',
      finalstyle: '',
      actions: false,
      groupKey: 'invoice_details_cost_per_hour_c',
      valueToShow: '32'
    },
    out_of_pocket: {
      type: 'string',
      displayName: 'Out of Pocket Expense',
      location: [Object],
      style: [Object],
      modify: false,
      group: 'invoice_details',
      key: 'out_of_pocket',
      documentDelete: true,
      value: '23',
      finalstyle: '',
      actions: false,
      groupKey: 'invoice_details_out_of_pocket',
      valueToShow: '23'
    }
  },
  matterAttendedBy: "",
  partnerName: "",
  line_items: [
    {
      cost: "25,000",
      particular: "Legal Research and Case Analysis",
      resourceId: "65a11fad6fe114f938d2c795",
      resourceType: "Project",
      originalCost: 25000,
      subitems: []
    },
    {
      cost: "2,00,000",
      particular: "Comprehensive Legal Consultation Services",
      resourceId: "65a11fad6fe114f938d2c795",
      resourceType: "Project",
      originalCost: 200000,
      subitems: []
    },
    {
      cost: "50,000",
      particular: "Court Filing and Administrative Services",
      resourceId: "65a11fad6fe114f938d2c795",
      resourceType: "Project",
      originalCost: 50000,
      subitems: []
    },
    {
      cost: "50,000",
      particular: "Court Filing and Administrative Services",
      resourceId: "65a11fad6fe114f938d2c795",
      resourceType: "Project",
      originalCost: 50000,
      subitems: []
    },
    {
      cost: "50,000",
      particular: "Court Filing and Administrative Services",
      resourceId: "65a11fad6fe114f938d2c795",
      resourceType: "Project",
      originalCost: 50000,
      subitems: []
    },
    // {
    //   cost: "10,00,00",
    //   particular:
    //     "Professional Fees on Fixed Fee Basis ",
    //   resourceId: "65a11fad6fe114f938d2c795",
    //   resourceType: "Project",
    //   originalCost: 10000,
    //   subitems: [ 
    //     { subitem: 'fwe', cost: 900 }, 
    //     { subitem: 'feqw', cost: 89 } 
    //   ]    
    //   // subitems: [
    //   //   { subitem: "Note that TDS may not be deducted", cost: 100 },
    //   //   // { subitem: "Note that TDS may not be deducted", cost: 200 }
    //   // ],
    // },
    // {
    //   cost: "10,00,00",
    //   particular:
    //     "Professional on Fixed Fee Basis ",
    //   resourceId: "65a11fad6fe114f938d2c795",
    //   resourceType: "Project",
    //   originalCost: 10000,
    //   subitems: [ 
    //     { subitem: 'fee', cost: 99990000 }, 
    //     { subitem: 'uuu', cost: 9000 } 
    //   ]
    //   // subitems: [
    //   //   { subitem: "Note that TDS may not be deducted", cost: 100 },
    //   //   // { subitem: "Note that TDS may not be deducted", cost: 200 }
    //   // ],
    // },
    // {
    //   cost: "10,00,00",
    //   particular:
    //     "Professional on Fixed Fee Basis ",
    //   resourceId: "65a11fad6fe114f938d2c795",
    //   resourceType: "Project",
    //   originalCost: 10000,
    //   subitems: [ 
    //     { subitem: 'fee', cost: 99990000 }, 
    //     { subitem: 'uuu', cost: 9000 } 
    //   ]
    //   // subitems: [
    //   //   { subitem: "Note that TDS may not be deducted", cost: 100 },
    //   //   // { subitem: "Note that TDS may not be deducted", cost: 200 }
    //   // ],
    // },
    // {
    //   cost: "10,00,00",
    //   particular:
    //     "Professional Fees on Fixed Fee Basis ",
    //   resourceId: "65a11fad6fe114f938d2c795",
    //   resourceType: "Project",
    //   originalCost: 10000,
    //   subitems: [ 
    //     { subitem: 'fwe', cost: 900 }, 
    //     { subitem: 'feqw', cost: 89 } 
    //   ]    
    //   // subitems: [
    //   //   { subitem: "Note that TDS may not be deducted", cost: 100 },
    //   //   // { subitem: "Note that TDS may not be deducted", cost: 200 }
    //   // ],
    // },
    // {
    //   cost: "10,00,00",
    //   particular:
    //     "Professional Fees on Fixed Fee Basis ",
    //   resourceId: "65a11fad6fe114f938d2c795",
    //   resourceType: "Project",
    //   originalCost: 10000,
    //   subitems: [ 
    //     { subitem: 'fwe', cost: 900 }, 
    //     { subitem: 'feqw', cost: 89 } 
    //   ]    
    //   // subitems: [
    //   //   { subitem: "Note that TDS may not be deducted", cost: 100 },
    //   //   // { subitem: "Note that TDS may not be deducted", cost: 200 }
    //   // ],
    // },
    // {
    //   cost: "10,00,00",
    //   particular:
    //     "Professional on Fixed Fee Basis ",
    //   resourceId: "65a11fad6fe114f938d2c795",
    //   resourceType: "Project",
    //   originalCost: 10000,
    //   subitems: [ 
    //     { subitem: 'fee', cost: 99990000 }, 
    //     { subitem: 'uuu', cost: 9000 } 
    //   ]
    //   // subitems: [
    //   //   { subitem: "Note that TDS may not be deducted", cost: 100 },
    //   //   // { subitem: "Note that TDS may not be deducted", cost: 200 }
    //   // ],
    // },
    // {
    //   cost: "10,00,00",
    //   particular:
    //     "Professional on Fixed Fee Basis ",
    //   resourceId: "65a11fad6fe114f938d2c795",
    //   resourceType: "Project",
    //   originalCost: 10000,
    //   subitems: [ 
    //     { subitem: 'fee', cost: 99990000 }, 
    //     { subitem: 'uuu', cost: 9000 } 
    //   ]
    //   // subitems: [
    //   //   { subitem: "Note that TDS may not be deducted", cost: 100 },
    //   //   // { subitem: "Note that TDS may not be deducted", cost: 200 }
    //   // ],
    // },
  ],
};

const pdfOptions = {
  format: "A4",
  header: {
    height: "28mm",
    contents: `
      <table role="presentation" aria-hidden="true" border="0" cellpadding="0" cellspacing="0"
             align="center" width="93%" style="max-width:660px;">
        <tbody>
          <tr>
            <td align="center" valign="top" style="font-size:0; padding: 10px 0;">
              <div style="display:inline-block; margin: 0 -2px; max-width: 200px; min-width:160px; vertical-align:top; width:100%;">
                <table role="presentation" aria-hidden="true" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tbody>
                    <tr>
                      <td dir="ltr" style="padding: 20px 10px 10px 10px;">
                        <img src="https://provakil.com/images/pv-logo.svg"
                             aria-hidden="true" width="300" border="0" alt="alt_text"
                             style="width: 100%; max-width: 300px; height: auto; background: #ffffff; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555;">
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div style="display:inline-block; margin: 0 -2px; max-width:63%; min-width:320px; vertical-align:top;">
                <table role="presentation" aria-hidden="true" cellspacing="0" cellpadding="0" border="0" align="right" width="88%">
                  <tbody>
                    <tr>
                      <td style="font-weight:700; padding:15px 23px 5px 20px; text-align:right; text-transform:uppercase;
                                 font-family: -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif;
                                 font-size:13px; line-height:13px; letter-spacing: 0.07em;">
                        <strong>TAX INVOICE ${data.invoice_num || ''}</strong><br>
                        ${data.customFields?.po_so_number?.value
                          ? `<strong>P.O./S.O. Number ${data.customFields.po_so_number.value}</strong><br>`
                          : ''}
                        <span style="font-weight:400; font-size: 9.8px;">
                          ${data.invoice_date || ''}
                        </span><br>
                        <i style="font-weight:400; font-size: 9.8px; margin-right: 5px;">Original for Recipient</i>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    `
  },
  footer: {
    height: "70mm",
    contents: `
      <table style="width:100%; font-family: -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif;">
        <tr>
        <td style="text-align:right; padding: 0 25px;">
          <div style="font-weight:500; font-size:11px; letter-spacing: 0.07em;">
            For PVKL Tech Services <br> 
            <span style="display:inline-block; margin-right:5px;">Private Limted</span>
          </div>
          <div style="padding: 6px 0;">
            <img src="https://provakil.com/images/signature-1.png"
                 width="120"
                 style="max-width: 150px; height: auto;" />
          </div>
          <div style="font-weight:500; font-size:11px; line-height:1.2; letter-spacing: 0.07em;">
            Authorised Signatory
          </div>
        </td>
        </tr>
        <tr>
        <td style="text-align:center; padding-top: 12px; font-size:12px;">
          <i>For any queries, please contact us at help@provakil.com or call us at 1800-547-0300</i>
        </td>
      </tr>
      </table>
    `
  }
};

ejs.renderFile("./test.html", data, (err, str) => {
  if (err) {
    return console.error(err);
  }

  pdf.create(str, pdfOptions).toFile("out.pdf", (err, res) => {
    if (err) {
      return console.error(err);
    }

    console.log(res);
  });
});