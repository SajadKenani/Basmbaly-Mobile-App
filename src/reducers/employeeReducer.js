import { SET_EMPLOYEE_NAME, SET_EMPLOYEE_PHONE, SET_EMPLOYEE_TITLE, SET_EMPLOYEE_SALARY, SET_EMPLOYEE_DISCOUNT, SET_EMPLOYEE_PASSWORD, SET_EMPLOYEE_BARCODE, SET_EMPLOYEE_SELECTED, SET_EMPLOYEE_START, SET_EMPLOYEE_GROUPID} from '../actions/employeeActions';

const initialState = {
  employeeName: '',
  employeePhone: '',
  employeeTitle: '',
  employeeSalary: '',

  employeeDiscount: [],
  employeePassword: '',
  employeeBarcode: "",
  employeeSelected: '',
  employeeTasks: "",

  employeeStart: "",

  groupId: "",
  employeeDiscountedSalary: [{}],
};

const employeeReducer = (state = initialState, action) => {
  switch (action.type) {

    case SET_EMPLOYEE_NAME:
      return {
        ...state,
        employeeName: action.payload,
      };

    case SET_EMPLOYEE_PHONE:
      return {
        ...state,
        employeePhone: action.payload,
      };

      case SET_EMPLOYEE_TITLE:
        return {
          ...state,
          employeeTitle: action.payload,
        };

      case SET_EMPLOYEE_SALARY:
        return {
          ...state,
          employeeSalary: action.payload,
        };
        
      // case SET_EMPLOYEE_DELAY_HOURS:
      //   return {
      //     ...state,
      //     delayhours: action.payload,
      //   };

      //   case SET_EMPLOYEE_DELAY_MINUTES:
      //       return {
      //         ...state,
      //         delayminutes: action.payload,
      //       };

        case SET_EMPLOYEE_DISCOUNT:
            return {
              ...state,
              employeeDiscount: action.payload,
            };


            
        case SET_EMPLOYEE_PASSWORD:
            return {
              ...state,
              employeePassword: action.payload,
            };

            case SET_EMPLOYEE_BARCODE:
                return {
                  ...state,
                  employeeBarcode: action.payload,
                };

                case SET_EMPLOYEE_SELECTED:
                  return {
                    ...state,
                    employeeSelected: action.payload,
                  };

                  case SET_EMPLOYEE_START:
                    return {
                      ...state,
                      employeeStart: action.payload,
                    };

                    case SET_EMPLOYEE_GROUPID:
                      return {
                        ...state,
                        groupId: action.payload,
                      };

    default:
      return state;
  }
};

export default employeeReducer;
