import React, { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import AppHeader from '../components/AppHeader';
import AppNavbar from '../components/AppNavbar';
import AppFooter from '../components/AppFooter';
import WebLayout from '../components/WebLayout';

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
} from 'react-native';

const contentsItems = [
  "What is the procedure to apply for information?",
  "How much time and fee is required to obtain information?",
  "What are the reasons for denying information?",
  "How to apply for information?",
  "Frequently Asked Questions?",
  "FAQs about complaint filing procedures?",
  "FAQs about writing RTI application?",
  "Public Information Officer's duties and responsibilities?",
];

const faqData = [
  {
    id: 1,
    question: "What is the procedure to apply for information?",
    answer: [
      "Submit a typed or handwritten application in English, Hindi, or the official language of the concerned state, addressed to the Public Information Officer. Clearly specify the information you are seeking.",
      "You do not need to provide a reason for requesting the information. Only pay the prescribed fee if you are not below the poverty line.",
    ],
  },
  {
    id: 2,
    question: "How much time does it take to get information?",
    answer: [
      "Within 30 days from the date of application.",
      "For information related to a person's liberty or life: 48 hours. If the application is submitted to the Assistant Public Information Officer, add 5 more days to the above period.",
      "If third-party interests are involved, the time limit can extend up to 40 days (maximum time + time given to the third party to represent). Failure to provide information within the stipulated time shall be deemed as a refusal.",
    ],
  },
  {
    id: 3,
    question: "What is the fee for this?",
    answer: [
      "A prescribed application fee is required. If additional fees are necessary, they will be charged in writing with a proper accounting. The applicant can request the PIO to reconsider the fee charged. No fee shall be charged from Below Poverty Line (BPL) individuals. If the PIO fails to provide information within the prescribed time, the information must be provided free of charge.",
    ],
  },
  {
    id: 4,
    question: "What are the reasons for refusing information?",
    answer: [
      "Information whose disclosure is prohibited.",
      "(Section 8) Information falling under someone else's copyright, excluding the state.",
      "(Section 9) How to apply for information? - Frequently Asked Questions about complaint filing procedures and frequently asked questions about writing RTI applications.",
    ],
  },
  {
    id: 5,
    question: "Where and how can I file a complaint?",
    answer: [
      "For complaints regarding Public Authorities under the Central Government, approach the Central Information Commission (CIC). CIC Address: August Kranti Bhawan, Bhikaji Kama Place, New Delhi - 110066. Website: www.cic.gov.in. For state government public authorities, contact the State Information Commission (SIC).",
      "Complaints regarding state government public authorities should be filed with the respective State Information Commission. Simultaneously, making efforts for mediation at the level of Secretary/Chief Secretary or the head of the concerned organization/department in the state capital can be beneficial for obtaining information.",
      "After filing a complaint, verify its registration on the respective website, note the registration number, and track its current status. Send a copy of your complaint to the Public Information Officer/First Appellate Authority along with the Central/State Information Commission. A complaint is additional to the second/final appeal available to applicants.",
    ],
  },
  {
    id: 6,
    question: "Are there prescribed formats for complaints? What can be asked in a complaint?",
    answer: [
      "For complaints regarding Public Authorities under the Central Government, approach the Central Information Commission (CIC). CIC Address: August Kranti Bhawan, Bhikaji Kama Place, New Delhi - 110066. Website: www.cic.gov.in. For state government public authorities, contact the State Information Commission (SIC).",
      "Complaints regarding state government public authorities should be filed with the respective State Information Commission. Simultaneously, making efforts for mediation at the level of Secretary/Chief Secretary or the head of the concerned organization/department in the state capital can be beneficial for obtaining information.",
      "After filing a complaint, verify its registration on the respective website, note the registration number, and track its current status.",
      "Send a copy of your complaint to the Public Information Officer/First Appellate Authority along with the Central/State Information Commission.",
      "A complaint is additional to the second/final appeal available to applicants.",
    ],
  },
  {
    id: 7,
    question: "Are there prescribed formats for filing complaints? What can be asked in a complaint?",
    answer: [
      "The CIC and some SICs have prescribed formats for certain minimum information or documents. Attaching these with the complaint is essential.",
      "Some State Commissions have made it mandatory to file complaints in a prescribed format. Under this Act, you can also request punishment for the PIO/First Appellate Authority and claim compensation for delay in receiving information. If the desired information pertains to life and liberty, explicitly write 'Life and Liberty - Urgent' on the complaint to ensure priority and timely resolution. If the State Information Commission has email available, it is beneficial to follow up through it.",
    ],
  },
  {
    id: 8,
    question: "Do I have to pay any fee for filing a complaint?",
    answer: [
      "The Central Information Commission does not charge any fee for complaints. Some State Commissions charge a fee.",
      "There is no time limit for filing a complaint, but it is best to file it within a reasonable period from when the cause of action arose.",
    ],
  },
  {
    id: 9,
    question: "What response will I get to my complaint?",
    answer: [
      "Sometimes, before the matter goes to the Central or State Information Commission, your complaint is resolved by the Public Information Officer/First Appellate Authority.",
      "Information Commissions have powers to issue summons, compel attendance before the court, present evidence on oath, submit records, etc.",
      "PIOs/First Appellate Authorities are flooded with appeals and complaints, leading to a large number of pending cases. It may take 12 to 36 months for your complaint to be heard.",
    ],
  },
  {
    id: 10,
    question: "What are the guidelines for writing an application? - OR - How to write an application?",
    answer: [
      "It is very important to frame your questions correctly when filing an RTI application. Irrelevant or misleading questions give the PIO an opportunity to reject your application. Follow these guidelines:",
      "Use plain white paper to write the application. There is no need to use ruled paper or court fee stamps.",
      "You can write manually or type. Typing is not mandatory.",
      "Write legibly.",
      "There is no page limit.",
      "You can ask any number of questions in one application. However, it is always better to ask fewer questions and ensure they are related to each other.",
      "You can ask very short questions. But do not request a huge volume of information at once. Your name and signature are required on the application. You do not need to write your designation because every citizen has the right to information.",
      "Do not ask 'Why' questions (questions asking for reasons). Such questions are likely to be rejected on the grounds of falling outside the RTI Act's scope.",
      "For example, a question like 'Why did you not approve this resolution?' will certainly be rejected. Under Section 4(1)(d), if you are an 'affected person', you may ask for reasons behind 'administrative' or 'quasi-judicial' decisions.",
      "If you are requesting a large volume of information, ask for it on a CD to reduce costs. Remember, you do not need to state a reason for requesting the information.",
      "At the end of your application, provide details of the fee paid. For example: BC/DD/IPO number, issuing bank/post office, date, cash receipt details, etc.",
    ],
  },
  {
    id: 11,
    question: "In whose name should the application be made?",
    answer: [
      "Write the name and address of the Public Information Officer to whom you wish to apply. If you do not know the location of the concerned PIO/Assistant PIO, you can send your application with the prescribed fee to the concerned department, addressed as 'Public Information Officer, C/o Head of Department'.",
      "This application will then be forwarded by the Head of Department to the concerned PIO. Do not write a specific PIO's name on your application, as transfer of that officer might cause procedural delays.",
    ],
  },
  {
    id: 12,
    question: "Are the application procedure, rules, and fees different for each state?",
    answer: [
      "Public Authorities under Central and State Governments, Legislatures, and Supreme/High Courts have prescribed different rules for the Right to Information. The fee amount and payment method may vary by state, and it is essential to check the proper rules applicable to you.",
      "A person can pay the application fee through the following methods:",
      "- Paying cash in person (ensure you get a receipt of payment)",
      "- Through the Post Office via: Demand Draft/Banker's Cheque, Indian Postal Order, Money Order (only in some states), Court Fee Stamps (only in some states)",
      "Some states have opened specific accounts for this purpose. You must deposit your fee into that account. You can do this by going to any State Bank of India branch, depositing the money into that specific account, and attaching the receipt to your application. Alternatively, you can send a Postal Order or Demand Draft drawn in the name of that account along with your application.",
      "For Central Public Authorities under the Central Information Rules, the Department of Posts has communicated that BC/DD/Indian Postal Order can be drawn in the name of the 'Accounts Officer'.",
    ],
  },
  {
    id: 13,
    question: "How to write the first appeal under the RTI Act?",
    answer: [
      "Follow these guidelines when writing the first appeal under the RTI Act 2005:",
      "The applicant must file the first appeal with the First Appellate Authority within 30 days of receiving the CPIO's decision.",
      "If no response is received from CPIO within 30 days (or 35 days if application was made to ACPIO) from the date of acknowledgement by CPIO/ACPIO, the applicant must file the first appeal within 30 days from the expected date of receiving the response.",
      "You can obtain the name, designation, and address of the First Appellate Authority from the letter containing the CPIO's decision.",
      "If no response is received, visit the concerned government department/office/public undertaking's website and refer to the RTI logo for these details.",
      "If despite all efforts you cannot find the First Appellate Authority's details, address your first appeal as follows: 'First Appellate Authority under RTI Act 2005, C/o Head of Department/Office (also mention the address of the head PIO of the department/office)'.",
      "If you wish to remain present during the hearing of the first appeal, mention this at the end of your appeal.",
      "No fee is charged for first appeals concerning Public Authorities under the Central Government.",
      "Some states charge a fee and also require the application to be in a specific format. The applicant must 'attest' all photocopies of annexures mentioned in the appeal by writing 'attested' and putting their full signature underneath.",
      "Keep a set of appeal, postal receipts, registered post acknowledgement, etc. with yourself. You can submit these documents personally, but sending via Registered Post or Speed Post is better. Avoid using private couriers.",
      "The First Appellate Authority is expected to decide within 30 days of receiving the first appeal. If valid reasons are provided in writing, this can be extended by 15 more days (total 45 days). The First Appellate Authority can give their order in writing or orally.",
    ],
  },
  {
    id: 14,
    question: "How to file the second appeal under the RTI Act?",
    answer: [
      "Fill the appeal form given below, along with the index and timeline of progress. Remove words like 'complaint/complainant' if filing an appeal. Remove words like 'second appeal/appellant' if filing a complaint. Get it typed in double spacing.",
      "Make one photocopy each of: original RTI application with annexures, first appeal with annexures, bank DD/payslip/postal order/cash receipt for fee of Rs. 10/- and other fees paid, letter demanding fees from CPIO (if any), receipt of sending original application and first appeal by post, post acknowledgement/official receipt from CPIO and First Appellate Authority, decisions received from CPIO and First Appellate Authority (if any). Arrange all documents in order as per index and write page numbers in the top right corner of each page. This creates one set of the second appeal/complaint.",
      "Make 4 more such sets after taking photocopies.",
      "Sign each page of the appeal, index, and timeline table (for all five sets). Write 'attested' on all photocopies and sign below the word to make all copies 'self-attested'.",
      "Send one set via Speed Post/Registered Post/Certificate of Posting to the CPIO and First Appellate Authority, and attach the copy of receipt (after filling details in index/timeline table) to the original set, the second appeal/complaint, and your own copy.",
      "Send the original set and one additional copy via Registered AD Post to the Commission address: Registrar, Central Information Commission, 2nd Floor, August Kranti Bhawan, Bhikaji Kama Place, New Delhi - 110066.",
      "Avoid using private courier services.",
      "Keep one set with yourself for reference, along with proof of sending and the acknowledgement received from Central Information Commission/CPIO/First Appellate Authority confirming receipt of the second appeal/complaint.",
      "You may request the CIC to further investigate by sending a copy of the second appeal/complaint without annexures. You may also attach a photocopy of the Registered Post receipt.",
      "While filing first or second appeal, you can also consult local NGOs, voluntary organizations, or individuals working on RTI matters. Such services are generally free.",
    ],
  },
  {
    id: 15,
    question: "Who can obtain information under the RTI Act?",
    answer: [
      "Any Indian citizen can obtain information under this Act. This law applies throughout India except Jammu and Kashmir.",
      "Indian citizens residing outside India, i.e., OCIs and PIOs (Persons of Indian Origin) with official cards can also obtain information under this Act.",
      "OCIs and PIOs can file applications with the help of the local Indian Embassy/Consulate/High Commission. Information about the application fee in local currency and payment methods will be provided to them by the Indian Embassy/Consulate/High Commission.",
    ],
  },
  {
    id: 16,
    question: "How to file an RTI application?",
    answer: [
      "To ensure your RTI application reaches the PIO and to obtain proof of submission, use one of these methods:",
      "Submitting in person - Get a signature/stamp and date from the PIO or receipt section on your copy of the application and fee receipt.",
      "Via Registered Post with AD - The AD card received from the Post Office is considered proof of submission. If the card lacks proper signature/stamp/date, follow up with the concerned post office.",
      "Keep a printout of the delivery status.",
      "Avoid using ordinary post or private courier services as you won't get reliable proof of delivery.",
      "Example questions (add your own): Provide information about the daily progress of actions taken on my application/return/petition. E.g., when and which officer received my application, how long they had it, what action they took? Names and designations of all officers who did or did not take action on my application.",
      "What action should be taken against these officers for not taking proper action on the application and causing public harassment? When should this action be taken? When will my work be completed?",
      "Provide a list of RTI applications received after mine with the following details: Name of applicant/taxpayer/petitioner/receipt no., date of filing application/return/petition, date of disposal of application/return/petition. Provide a copy/printout of documents containing details of receipts of the above applications/returns/petitions. Provide information about applications/returns/petitions filed after mine but disposed of before mine, and clarify the reasons for their early disposal.",
    ],
  },
  {
    id: 17,
    question: "When will the inquiry into the above matter commence?",
    answer: [
      "Maharashtra: Procedure for obtaining information under RTI via Post: Send a Demand Draft/Cheque of Rs. 10/- or Money Order or court fee stamp of that value in the name of the Public Authority/Government Office, addressed to the PIO.",
      "In Person: You can submit the application to the PIO yourself or through another person, and pay the fee at their office.",
    ],
  },
];

// CollapsibleLegalText component for the long legal paragraphs with light green background
function CollapsibleLegalText({ children, id }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const previewLength = 500;

  if (children.length <= previewLength) {
    return (
      <Text style={styles.legalTextFull}>
        {children}
      </Text>
    );
  }

  const preview = children.slice(0, previewLength);

  return (
    <View style={styles.legalContainer}>
      <Text style={styles.legalText}>
        {isExpanded ? children : `${preview}... `}
        <Text
          style={styles.readMoreButton}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Show Less" : "Read More"}
        </Text>
      </Text>
    </View>
  );
}

// Place this OUTSIDE the component (before export default)
const isWeb = Platform.OS === 'web';

export default function RTIPage({ navigation }) {
  const [openId, setOpenId] = useState(null);
  const { width } = useWindowDimensions();

  const toggle = (id) => setOpenId(openId === id ? null : id);

  const legalParagraphs = [
    "- Office Delay Act: RNI No . MAHBIL / 2009 / 31745 Reg . No . MH / MR / South - 327 / 2013 - 15\n\nMaharashtra Government Gazette Extraordinary Part One: Middle Sub-Division - Year 5, Issue 36] Tuesday, November 19, 2013 / Kartik 28, Shaka 1935 Pages 22, Price: Rs. 12.00\n\nExtraordinary Number 61 Authorized Publication General Administration Department: Madam Cama Marg, Hutatma Rajguru Chowk, Mantralaya, Mumbai 400 032, Date 14 November 2013.\n\nNotification Maharashtra Government Servants' Regulation of Transfers and Prevention of Delay in Discharge of Official Duties Act, 2005: . . No POD - 1007 / P.C. No. 1 / 18 (R.V.Ka.).\n\nMaharashtra Government Servants' Regulation of Transfers and Prevention of Delay in Discharge of Official Duties Act, 2005 (Maharashtra 20 of 2006), using the powers conferred under Section 14, Sub-section (2) and all other powers enabling thereto, superseding all existing rules, orders or memoranda made in this behalf, the Government of Maharashtra hereby makes the following rules, as previously published as required under Section 14, Sub-section (1) of the said Act.",
    "1. Short Title - (1) These rules may be called the Prevention of Delay in Discharge of Official Duties Rules, 2013. 2. *Definitions.* - In these rules, unless the context otherwise requires, (a) 'Act' means the Maharashtra Government Servants' Regulation of Transfers and Prevention of Delay in Discharge of Official Duties Act, 2005 (Maharashtra 21 of 2006). (b) 'Administrative Audit' means the mechanism prescribed by the Government to verify whether the final decision on a file or matter in any office or department has been properly submitted based on delegated powers, i.e., obtained after three levels, and whether the time limit prescribed under Section 10(1) of the Act has been complied with while deciding the matter and taking necessary action. (c) 'Pending Matter' means a matter where further action is to be taken after the stipulated period has elapsed. (1) 'Matter' means a received file or other related documents, references, correspondence, notes, etc., and their consolidated set.",
    "2. Maharashtra Government Gazette, Extraordinary Part One - Middle Sub-Division, November 19, 2013 / Kartik 28, Shaka 1935* (d) 'Correspondence' means incoming and outgoing references in the decision-making process, including written letters, telegrams, inter-departmental notes, fax messages, e-mails, orders issued by the government from time to time, circulars, government resolutions. (e) 'Dormant Matter' means a matter where the decision to be taken falls under the authority of others besides the state government, including matters where basic information or data needs to be collected from various authorities for compiling government reports, periodicals, statements, etc., and matters where the final order has been given but is awaiting compliance with the terms of the final order. However, this does not include matters under Section 11 of the Act; (f) 'File' means a set of documents related to a specific subject assigned a distinct number, including one or more of the following parts: (1) Correspondence, (2) Notes, (3) Appendices to correspondence, (4) Appendices to notes; (g) 'Finally Disposed' means the action taken on a received reference or correspondence after exchange of views, the final decision taken on such reference or correspondence, and no further action is pending on such order or correspondence; (h) 'Format' means the format appended to these rules. (i) 'Immediate and Urgent Reference' means postal received, including telegrams, telex messages, fax messages, letters, e-mails, etc., marked by the competent authority as immediate or urgent, considering the seriousness of the matter, with the aim of completing the required action within the time mentioned in Section 10(1) of the Act; (j) 'In-charge Minister' means the minister under whose charge the concerned subject or work is placed according to the Rules of Business of the Government of Maharashtra; (k) 'In-charge Branch Officer or Desk Officer' means an officer working at the taluka, sub-divisional office, district, divisional, or department level nominated for disposing or finally disposing of the relevant subject or work at the desk; (l) 'Submission Level' means the three levels of government employees responsible for submitting matters before the authority who has the power to make the final decision, considering the nature, level, and importance of various subjects handled by the office or department; (m) 'Note' means entries made on a file such as a summary of previous documents, description and analysis of issues or questions under consideration, instructions given regarding the expediting of any matter, and final orders. (n) Wherever words like file, matter, correspondence, note, draft, reference, opinion, proposal, forms, letters, post appear, they shall include their electronic forms like e-file, e-matter, e-correspondence, e-note, e-draft, e-reference, e-opinion, e-proposal, e-forms, e-mail, etc. Also, whenever the word service (service or facility) is used, it shall include providing service or facility through electronic means. (2) Words and expressions used but not defined in these rules shall have the same meanings as respectively assigned to them in the Act.",
    "3. Preparation of Citizens' Charter.* - (1) The Head of each administrative department in the Mantralaya and the Heads of all offices under their administrative control at divisional, district, taluka, sub-divisional, or local levels, as the case may be, shall prepare a separate Citizens' Charter for their respective offices. This Citizens' Charter shall be consistent with the Citizens' Charter at their respective headquarters.",
    "4. Maharashtra Government Gazette, Extraordinary Part One - Middle Sub-Division, November 19, 2013* / Kartik 28, Shaka 1935. This Citizens' Charter shall be prepared and published based on instructions contained in circulars or letters issued by the government from time to time, displayed in a conspicuous place in the concerned office, and such information shall be displayed in electronic form on the government or department's website or portal. (2) The Citizens' Charter published under sub-rule (1) shall be updated from time to time as required based on the government's revised policies, schemes, programs, projects, rules, orders, etc., and on 2nd May of each subsequent year by each office. Each office, after considering any objections or suggestions regarding the Citizens' Charter, discussing difficulties of concerned officers, and fully deliberating on received suggestions, shall finalize and publish it. Such information shall also be displayed in electronic form on the government or department's website or portal. (3) The prescribed documents required for providing services or facilities by the office or department shall be minimal. For this purpose, the head of each office or department shall review accordingly. Format 'K' containing the list of required documents for providing services or facilities by the office/department shall be made available free of cost and easily by the concerned office/department. The list of required documents shall be specified in Format 'Kh' by each office/department head. Such information shall also be displayed in electronic form on the government or department's website/portal. (4) An application received from any citizen in Format 'K' shall be checked according to the checklist in Format 'G' regarding its completeness. If found incomplete after checking, the applicant shall be immediately informed of the deficiencies so that the applicant can complete the formalities for filling the format. (5) If the citizen's application is complete, an acknowledgement in Format 'Gh' shall be given, clearly mentioning the period mentioned in that office/department's Citizens' Charter for providing that service/facility, and the office shall ensure that the citizen does not have to visit the office frequently. (6) The minimum period prescribed in the Citizens' Charter for providing service/facility shall be determined considering the time limits in the relevant Acts and rules. If a complaint is filed against delay in providing service/facility, or if such delay comes to the notice of the concerned office head or department head, they shall complete a preliminary inquiry within fifteen days. If it is found that the concerned government employee has systematically, knowingly, and willfully delayed or neglected, the responsibility shall be fixed, disciplinary inquiry shall be recommended to the appropriate authority, and the disciplinary authority shall issue orders for disciplinary proceedings against the concerned officer or employee. (7) Information technology shall be maximally utilized in offices, and highest priority shall be given to e-Governance while providing services/facilities to citizens. Every administrative department in the Mantralaya, after consultation with their subordinate Commissioners/Department Heads/Office Heads, shall implement a time-bound program to provide services/facilities through electronic means. Services/facilities to be provided to citizens through electronic means shall be finalized within six months. Accordingly, licenses, certificates, approvals, grants, and application forms for such services shall be made available online. Information about this shall be made available on the department or office's website. Arrangements shall also be made to provide services/facilities through current prevailing methods to citizens who cannot avail online services.",
    "5. Publishing list of powers delegated to subordinate officers for final decision making.* - The In-charge Secretary of the concerned administrative department at Mantralaya level, the Department Head at divisional level, or as the case may be, the district level officer and subordinate officers, who work under their supervision at various levels or to whom subject-wise or file-wise powers have been delegated for final decision making, shall prepare and publish a list of their powers, and display it in a conspicuous place in the concerned office as provided in Section 1, Sub-section (1) of the Act. The said list of powers shall be updated and published on 2nd May of each subsequent year. Such information shall also be displayed in electronic form on the government or department's website or portal. Part One M.U.V. - 61 - 1a",
    "6. Maharashtra Government Gazette, Extraordinary Part One - Middle Sub-Division, November 19, 2013 / Kartik 28, Shaka 1935 5. Prohibition on delegating powers to government officers against whom disciplinary inquiry is pending.* - Notwithstanding anything contained in Rule 4, (1) If any disciplinary inquiry regarding serious allegations is pending against any employee or officer under the relevant disciplinary rules, or if any officer has to face any criminal case or investigation, such employee or officer shall not be delegated powers for final decision making regarding any work of executive nature or sensitive work or subject. (2) If chargesheets have been issued against any officer for allegations of misuse of official position, financial irregularities, embezzlement, or corruption, or if a decision has been made at the level of the disciplinary inquiry officer to issue a chargesheet against such officer, or if such officer has been suspended for any such allegations, then even after reinstatement of such officer, until such inquiry or investigation is completed, the punishment imposed is executed, or the officer is fully exonerated from such allegations or accusations, powers for final decision making on executive or sensitive subjects shall not be delegated to him. Provided that, the Government, after examining the merits of the case and recording reasons, may consider delegating powers for making final decisions on executive and sensitive subjects to such government employees mentioned in sub-rules (1) and (2).",
    "7. Determining the level of authority for final decision making.* - (1) Subject to the provisions of Section 9 of the Act, the level for delegating powers for final decision making shall be determined by the Office Head or as the case may be, the Department Head, with the approval of the concerned In-charge Minister of the administrative department, considering the government decisions and orders issued from time to time by the Secretary of the concerned administrative department at Mantralaya level. Provided that, such submission level for final decision making shall not involve more than three officers. (2) A subject-wise list of delegation of each type of authority or power to an officer shall be maintained. (3) If the specific competent officer to whom final decision-making powers are delegated is absent or on leave, and the work of such competent authority cannot be postponed even temporarily, considering administrative convenience and urgency, the work of such competent authority shall be distributed among other officers of that establishment. Provided that, for extremely important matters like Cabinet notes and policy decisions, more than three levels may be kept. Provided further that, files of existing policies or orders requiring clarification or instructions to regional offices shall not be submitted to a level higher than the Secretary's level. Provided also that, reminders shall not be submitted to a superior level. (4) Files involving proposals for investments and infrastructure projects, and files/proposals received by the advisory department on policy matters to be placed before the Cabinet shall not be sent to junior officers or desks. Opinions or notes in such matters shall be recorded at the level of Deputy Secretary or at least Under Secretary. In exceptional circumstances, if Under Secretaries are unavailable, such files shall be submitted through the Desk Officer.",
    "8. Updating the list of officer levels.* - (1) The concerned administrative department at Mantralaya level, the department head at divisional level or district level, or any other office head shall prepare the list of powers delegated to subordinate officers within three months from the publication of these rules, and thereafter, such published list shall be updated on 2nd May of each subsequent year, and such information shall be displayed in electronic form on the government or department's website or portal.",
    "9. Maharashtra Government Gazette, Extraordinary Part One - Middle Sub-Division, November 19, 2013 / Kartik 28, Shaka 1935* (2) The concerned administrative department head at Mantralaya level shall, in the months of January and July each year, review the work of offices or departments randomly to ensure that each officer is properly and impartially exercising the powers delegated to them and that appropriate decisions are being made on matters falling within their purview. *8. Regarding acknowledgement of E-mails.* - Acknowledgement of receipt of e-mails shall be given by the concerned person. If the received e-mail is not related to that office, department, or desk, it shall be forwarded to the concerned office, department, or desk, and the applicant shall be informed via e-mail.",
    "10. Responsibility of each officer.* - The primary responsibility for submitting matters on time and finally disposing of them within the time limit prescribed in the Act shall lie with each officer in the Mantralaya and the officer in charge of offices at divisional, district, or taluka level.",
    "11. Measures to be taken to control progress of work of desks or branches.* - The in-charge branch, desk, or section officer shall monitor the progress of work in his branch, desk, or section and shall ensure the following: (a) No reference, file, or matter is neglected or pending due to lack of action; (b) Action has been personally taken on complex and important references; (c) Notes and drafts submitted to him have been scrutinized and, wherever necessary, his opinions or suggestions have been recorded before submitting them to the competent authority to ensure accuracy in notes and drafts; (d) Maximum matters have been disposed of by taking initiative and responsibility; (e) Appropriate and suitable measures have been adopted to ensure disposal of references or matters; (f) Daily work of the branch or desk is monitored; (g) A detailed analytical review of pending files in the branch, desk, or section is taken at the end of each month to strictly monitor the progress of work, and appropriate guidance and suitable corrective measures have been taken to dispose of pending files; (h) Records of the branch, desk, or section shall be maintained as follows: (1) Incoming post; (2) Matters under process; (3) Pending matters; (4) Dormant matters; (5) Matters with standing orders or collections; and (6) Finally disposed matters (sorted by categories A, B, C, D); The in-charge officer of the desk, branch, or section shall remain vigilant regarding implementation of rules.",
    "12. Restrictions to prevent delays in inter-departmental references.* - To prevent delays in informal references or matters between Mantralaya departments, the following action shall be taken: (a) Except for the Finance Department and Law & Justice Department, all matters or references that need to be sent to other departments for opinion or deliberation shall be directly marked to the concerned Joint Secretary/Deputy Secretary/Under Secretary, and their opinions shall be sought. For this purpose, each department shall prepare a list of names of its concerned Joint Secretaries, Deputy Secretaries, and Under Secretaries and the subjects related to them. Such a list shall be provided to each department. Such list shall also be made available on the government website. If any changes occur in said list, necessary corrections shall be made from time to time, and the list shall also be displayed conspicuously in the concerned section. Such information shall also be displayed in electronic form on the government or department's website or portal.",
    "13. Maharashtra Government Gazette, Extraordinary Part One - Middle Sub-Division, November 19, 2013 / Kartik 28, Shaka 1935* (b) If the proposal has been approved at the secretary level of another department, such proposal shall be carefully scrutinized at the joint secretary or deputy secretary level of the Finance Department, Planning Department, or General Administration Department, and there shall be no objection to rejecting it at the joint secretary or deputy secretary level. Provided that for this purpose, the secretary of that department must issue such an order. (c) If the secretary of that department does not agree with the opinions given by the joint secretary or deputy secretary of the Finance Department, Planning Department, or General Administration Department, such file shall be referred again to the Finance Department, Planning Department, or, as the case may be, the General Administration Department at the secretary level for review. (d) If the proposal has been forwarded by another department at secretary level as per clause (c) above, and the Finance Department, Planning Department, or General Administration Department wishes to reject such proposal, such rejection action shall be taken at the secretary level of the Finance Department, Planning Department, or, as the case may be, the General Administration Department. (e) After opinions of other departments have been recorded and the matter has been received by the original department, if differences of opinion are found, instead of writing further accounting notes, both secretaries or officers delegated with authority shall personally discuss the disputed question and dispose of the matter by mutual consent. (f) If the original department wishes to mark a file to more than one department, the file shall be presented to those departments in the same order as marked by the original department. (g) If adopting the procedure prescribed in clause (f) above is likely to cause delay in disposing of the matter, and the opinions expected from departments are not likely to be supportive or are inconsistent or contradictory with the original department's opinions, the original department shall prepare a separate proposal and forward the file separately to each concerned department to seek their opinions or views. (h) If the department believes that a particular matter received in its branch or section is related to another department, the department shall specify the exact entry in the Rules of Business of the Maharashtra Government with which this subject is related and, after obtaining the consent of the secretary of that department, send this matter to the concerned department. (i) If a question arises regarding which department should take action on correspondence received by a department, both departments shall discuss and resolve such issue. If this issue is not resolved within a week, the matter shall be decided by the Constitution and Procedure branch of the General Administration Department, and once a decision is given at the secretary level of the Constitution and Procedure (R.V.Ka.) branch of the General Administration Department, it shall be final unless there are any other instructions from the Chief Secretary or Hon'ble Chief Minister. If such a question regarding handling of a subject arises in any office other than a Mantralaya department, the matter shall be referred within two working days by the department head to the concerned in-charge secretary of the Mantralaya department. (j) While a question regarding transfer of a subject from one department to another is under consideration, the department that received the correspondence shall continue handling the subject related to it until a decision is made on transferring it to another department. In such cases, a separate proposal for transferring the subject shall be made by that department. (k) While preparing informal references to other departments for matters of investment and infrastructure projects, such matters shall not be forwarded like general matters. Doubts shall be resolved through discussion at secretary level or at least deputy secretary level, and after achieving consensus through preliminary procedures, notes shall be recorded, so that time is not wasted in writing and submitting notes repeatedly. A control register for matters related to investment and infrastructure projects received in the offices of secretaries of Mantralaya departments and other offices shall be maintained by the personal assistant to the secretary or, as the case may be, the department head, and the secretary or department head shall review the disposal or implementation of such matters based on this control register on either the first or last day of the week.",
    "14. Maharashtra Government Gazette, Extraordinary Part One - Middle Sub-Division, November 19, 2013 / Kartik 28, Shaka 1935 12. Procedure regarding seeking opinions or views from subordinate offices.* - If a Mantralaya department, department head, or district office finds it necessary to seek opinions or consider views from subordinate offices, the following procedure shall be followed: (a) Generally, documents of matters shall, as far as possible, not be sent to officers in subordinate offices unless really necessary. E-mail service shall be preferred for such correspondence, and sending reminders by e-mail shall be mandatory. (b) When documents of matters or the entire matter is sent to a subordinate office, the specific points on which opinions or views are to be sought from the officer in the subordinate office shall be clearly and category-wise specified. (c) The concerned officer of the subordinate office shall give a clear opinion or present views on the points specified for opinion or views. The said officer shall also elaborate on related issues and circumstances. (d) The officer of the subordinate office from whom views are sought shall suggest an appropriate action plan or give an opinion or express views considering the specified circumstances in that matter. (e) The subordinate office shall cite relevant laws, rules, and administrative orders of the government to support its recommendations on a matter. (f) In matters where information has been sought from subordinates or field officers, the specific date by which the information is expected shall be mentioned in the letter sent by the Mantralaya department. The specified time limit for the subordinate or field office to submit the required information shall be determined considering the scope of information, the working days likely required for the concerned department or district office to collect information from the subordinate offices under it, and the time required to actually send that information. *13. Measures for making final decisions on matters within the prescribed time limit.* - The time limit prescribed under Section 10 of the Act for disposal of matters is maximum, and matters shall be disposed of within that time limit. To prevent delays in such matters, the following measures shall be taken: (a) The office head or department head or any other authority empowered in this regard shall take a periodic review at the end of each month to see if the work assigned to government employees is being disposed of according to the standards set for their work. If such standards have not been specified, they shall be immediately specified by each office head or department head. (b) Powers shall be delegated to the heads of each office or department under the administrative control of Mantralaya departments as far as possible for deciding on matters, and periodic review shall be taken to see if the delegated powers are being used effectively, and necessary measures shall be taken in that regard. (c) The work procedure specified for processing a matter for final decision shall be reviewed and amended if necessary. *14. Determining matters or issues mentioned in Section 11 of the Act and preparing a list.* - The concerned administrative department at Mantralaya level and the department head at divisional level or, as the case may be, the district office head at district level shall determine and prepare a list of matters or issues falling under Section 11 of the Act to which the provisions of Section 10 of the Act will not apply in specified circumstances."
  ];

  const pageContent = (
    <>
      <View style={styles.content}>
        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>What is RTI?</Text>
          </View>
        </View>

        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>
            Simple and easy procedure to obtain information under the Right to Information Act
          </Text>
          <Text style={styles.headerDescription}>
            Complete information about how to apply under RTI, how much time it takes, what the fees are, how to file an appeal, and the responsibilities of the Public Information Officer.
          </Text>
        </View>

        <View style={styles.twoColumnContainer}>
          <View style={styles.contentsCard}>
            <View style={styles.contentsHeader}>
              <View style={styles.contentsIcon}>
                <Text style={styles.contentsIconText}>📚</Text>
              </View>
              <Text style={styles.contentsTitle}>Contents</Text>
            </View>
            {contentsItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  // Scroll to section
                }}
              >
                <Text style={styles.contentsItem}>
                  {index + 1}. {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoSubtitle}>Right to Information</Text>
            <Text style={styles.infoTitle}>
              It is your right to know the procedure for obtaining information under the RTI Act in the state of Maharashtra
            </Text>
            <Text style={styles.infoDescription}>
              Using RTI, any citizen can request information from the government. It is important to know the correct application, timely appeal, and required documents.
            </Text>
          </View>
        </View>

        <View style={styles.faqContainer}>
          <View style={styles.faqHeader}>
            <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
          </View>

          {faqData.map((faq) => (
            <View key={faq.id} style={styles.faqItem}>
              <TouchableOpacity
                style={[styles.faqQuestion, openId === faq.id && styles.faqQuestionActive]}
                onPress={() => toggle(faq.id)}
              >
                <View style={styles.faqQuestionContent}>
                  <Text style={styles.faqQuestionLabel}>Question {faq.id}</Text>
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                </View>
                <View style={styles.faqToggleIcon}>
                  <Text style={styles.faqToggleIconText}>
                    {openId === faq.id ? "−" : "+"}
                  </Text>
                </View>
              </TouchableOpacity>

              {openId === faq.id && (
                <View style={styles.faqAnswer}>
                  {faq.answer.map((para, i) => (
                    <Text key={i} style={styles.faqAnswerText}>
                      {para}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.responsibilityContainer}>
          <View style={styles.responsibilityHeader}>
            <Text style={styles.responsibilityTitle}>
              Public Information Officer duties and responsibilities
            </Text>
            <Text style={styles.responsibilitySubtitle}>
              Action to be taken by the Public Information Officer within the first 5 days of receiving an RTI application from a citizen
            </Text>
          </View>

          <View style={styles.responsibilityList}>
            {[
              "Provide acknowledgement of received application and record it in the RTI register.",
              "Clarify the requested information if needed.",
              "If the requested information is extensive or old and will take time to locate or compile, inform the applicant accordingly.",
              "As per Section 2(f), if information is old, vague, or extensive, inform the applicant about inspecting the records.",
              "If you are taking help from Assistant PIO under Section 5(4), inform the applicant with a copy of the letter.",
              "If information is available and specific, calculate the fee and inform the applicant to make payment.",
              "If requested information belongs to a third party, send notice to the third party and wait 10 days for their explanation/response.",
              "If information is eligible for disclosure, provide it in the same form as available under Section 7(9).",
              "If requested information is old and cannot be photocopied, it can be denied by providing inspection.",
              "If requested information is not provided within 30 days and the applicant requested in person, provide acknowledgement on the filed application.",
              "When denying information under Sections 8 and 9, provide a reasoned decision.",
              "If documents are available from the questions raised by the applicant in the application, provide them.",
              "If information is old, extensive, or will take time to collect, inform the applicant within the first 5 days.",
              "If information is requested by post, calculate information fee plus postage and inform the applicant to pay the total amount, and keep the proof of receipt as record.",
              "If requested information belongs to another public authority, forward the application to the appropriate authority and provide a copy of the letter to the applicant.",
            ].map((item, index) => (
              <View key={index} style={styles.responsibilityItem}>
                <View style={styles.responsibilityNumber}>
                  <Text style={styles.responsibilityNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.responsibilityItemText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.legalSection}>
            {legalParagraphs.map((para, idx) => (
              <CollapsibleLegalText key={idx} id={`legal-${idx}`}>
                {para}
              </CollapsibleLegalText>
            ))}
          </View>
        </View>
      </View>
      <AppFooter navigation={navigation} />
    </>
  );

  const page = (
  <View style={{ flex: 1 }}>
    {isWeb && <AppNavbar navigation={navigation} activeScreen="WhatIsRTI" />}
    <AppHeader navigation={navigation} compact={!isWeb} />
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {pageContent}
    </ScrollView>
    {!isWeb && <AppNavbar navigation={navigation} activeScreen="WhatIsRTI" />}
  </View>
);
  return isWeb ? <WebLayout>{page}</WebLayout> : page;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef7e0',
  },
  content: {
    padding: 16,
    paddingTop: 32,
    paddingBottom: 32,
  },
  badgeContainer: {
    marginBottom: 24,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    elevation: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#dc2626',
  },
  headerCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 32,
    color: '#111827',
    marginBottom: 16,
  },
  headerDescription: {
    fontSize: 14,
    lineHeight: 24,
    color: '#4b5563',
  },
  twoColumnContainer: {
    marginBottom: 32,
  },
  contentsCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#fed7aa',
    padding: 24,
    marginBottom: 16,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    elevation: 1,
  },
  contentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  contentsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentsIconText: {
    fontSize: 18,
    color: 'white',
  },
  contentsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  contentsItem: {
    fontSize: 14,
    color: '#374151',
    paddingVertical: 8,
    paddingLeft: 8,
  },
  infoCard: {
    backgroundColor: '#dc2626',
    borderRadius: 24,
    padding: 24,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  infoSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#fed7aa',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 28,
    color: 'white',
    marginBottom: 16,
  },
  infoDescription: {
    fontSize: 14,
    lineHeight: 24,
    color: '#fef2f2',
  },
  faqContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 40,
    overflow: 'hidden',
  },
  faqHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f9fafb',
  },
  faqTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  faqQuestionActive: {
    backgroundColor: '#fff7ed',
  },
  faqQuestionContent: {
    flex: 1,
  },
  faqQuestionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#ef4444',
    marginBottom: 4,
  },
  faqQuestionText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 24,
    color: '#1f2937',
  },
  faqToggleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  faqToggleIconText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  faqAnswer: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 32,
    color: '#374151',
    marginBottom: 12,
  },
  responsibilityContainer: {
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 24,
  },
  responsibilityHeader: {
    marginBottom: 24,
  },
  responsibilityTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 12,
  },
  responsibilitySubtitle: {
    fontSize: 14,
    lineHeight: 24,
    color: '#374151',
    textAlign: 'center',
  },
  responsibilityList: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  responsibilityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 8,
  },
  responsibilityNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  responsibilityNumberText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  responsibilityItemText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 24,
    color: '#374151',
  },
  legalSection: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
    padding: 16,
  },
  legalContainer: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 12,
  },
  legalText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 28,
    color: '#14532d',
  },
  legalTextFull: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 28,
    color: '#14532d',
  },
  readMoreButton: {
    fontWeight: '500',
    color: '#15803d',
    textDecorationLine: 'underline',
  },
});