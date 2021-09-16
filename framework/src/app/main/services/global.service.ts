import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';

interface ShareObj { }
interface accessSet { }
interface environment { }

@Injectable()

export class GlobalDataService {
  environment: environment = {
    isCaptchaWhitelsit: false,
    isAPISuccess: false
  };
  shareObj: ShareObj = {};
  accessSet: accessSet = {
    'home': {
      'companyLogo': 'sec_CompanyLogo_page_home',
      'userNameDD': 'sec_UserName_page_home',
      'myCompanyPage': 'sec_My Company_page_home',
      'myAccountPage': 'sec_My Account_page_home'
    },
    'subheader': {
      'navigation': 'sec_Navigation_page_home',
      'dashboardPage': 'sec_DashBoard_page_home',
      'usersPage': 'sec_Users_page_home',
      'appsPage': 'sec_Apps_page_home',
      'cloudReportsPage': 'sec_CloudReports_page_home',
      'myCompanyRead': 'sec_Adminstrator_page_Company_Read'
    },
    'dashboardPage': {
      'launchApps': 'sec_Launch Apps_page_Dashboard'
    },
    'myAppsPage': {
      'applicationsDetail': 'sec_users_page_my-apps-detail'
    },
    'manageUsersPage': {
      'createNewUser': 'Btn_Create_User_page_Users'
    },
    'individualUsersPage': {
      'accountPageRead': 'sec_Account  Read_page_Individual User',
      'applicationPage': 'sec_Application_page_Individual User',
      'personalInfo': 'sec_Personal Read_page_Individual User',
      'terminate': 'sec_Terminate_page_Individual User'
    }
  };
}