import { SET_EMPLOYEE_NAME, SET_EMPLOYEE_PHONE, SET_EMPLOYEE_TITLE, SET_EMPLOYEE_SALARY, SET_EMPLOYEE_DISCOUNT, SET_EMPLOYEE_PASSWORD, SET_EMPLOYEE_BARCODE, SET_EMPLOYEE_SELECTED, SET_EMPLOYEE_START, SET_EMPLOYEE_GROUPID, SET_EMPLOYEE_TASKS} from '../action/employeeActions';

const initialState = {
  name: '',
  phone: '',
  title: '',
  salary: '',

  discount: [],
  password: '',
  barcode: "",
  selected: '',
  tasks: "",

  start: "",

  groupId: "",


};

const employeeReducer = (state = initialState, action) => {
  switch (action.type) {

    case SET_EMPLOYEE_NAME:
      return {
        ...state,
        name: action.payload,
      };

    case SET_EMPLOYEE_PHONE:
      return {
        ...state,
        phone: action.payload,
      };

      case SET_EMPLOYEE_TITLE:
        return {
          ...state,
          title: action.payload,
        };

      case SET_EMPLOYEE_SALARY:
        return {
          ...state,
          salary: action.payload,
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
              discount: action.payload,
            };


            
        case SET_EMPLOYEE_PASSWORD:
            return {
              ...state,
              password: action.payload,
            };

            case SET_EMPLOYEE_BARCODE:
                return {
                  ...state,
                  barcode: action.payload,
                };

                case SET_EMPLOYEE_SELECTED:
                  return {
                    ...state,
                    selected: action.payload,
                  };

                  case SET_EMPLOYEE_START:
                    return {
                      ...state,
                      start: action.payload,
                    };

                    case SET_EMPLOYEE_GROUPID:
                      return {
                        ...state,
                        groupId: action.payload,
                      };

                      
                    case SET_EMPLOYEE_TASKS:
                      return {
                        ...state,
                        tasks: action.payload,
                      };

    default:
      return state;
  }
};

export default employeeReducer;
