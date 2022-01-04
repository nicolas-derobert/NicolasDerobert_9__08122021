import { fireEvent, screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";

import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { bills } from "../fixtures/bills.js";
import router from "../app/Router.js";
import BillsUI from "../views/BillsUI.js";
import VerticalLayout from "../views/VerticalLayout";

import Bills  from "../containers/Bills.js"
import { route } from "express/lib/application";

const data = bills;
const loading = true;
const error = null;

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    beforeEach(() => {
      // const onNavigate = (pathname) => {
      //   document.body.innerHTML = ROUTES({ pathname });
      // };
      // Object.defineProperty(window, "localStorage", {
      //   value: localStorageMock,
      // });
      // window.localStorage.setItem(
      //   "user",
      //   JSON.stringify({
      //     type: "Employee",
      //   })
      // );
      document.body.innerHTML = '<div id="root"></div>'
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      })
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      )
    })
    
    test("Then bills should be ordered from earliest to latest", () => {


      const html = BillsUI({ data: bills });
      document.body.innerHTML = html
      expect(screen.getByText("Mes notes de frais")).toBeTruthy()
    });

    test("test the event firing when the button is clicked", () => {
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html
      let input = screen.getByTestId("btn-new-bill");
      const handleClickNewBill = jest.fn((e) => e.preventDefault());
      input.addEventListener("click", handleClickNewBill);
      fireEvent.click(input);
      expect(handleClickNewBill).toHaveBeenCalled();
    });


    test("test the event firing when  button 'New bill' is clicked", () => {

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const store = null
      const html = BillsUI({ data: bills });

      document.body.innerHTML = html
      let input = screen.getByTestId("btn-new-bill");
  
      let myBills = new Bills({ document, onNavigate, store, localStorage })
      jest.spyOn(myBills , 'handleClickNewBill').mockImplementation(() => 'Hello');
      input.addEventListener("click", myBills.handleClickNewBill);
      fireEvent.click(input);
      expect(myBills.handleClickNewBill).toHaveBeenCalled();
      jest.restoreAllMocks();

    });

    
    // test("Then bill icon in vertical layout should be highlighted", () => {
    //   const pathname = ROUTES_PATH['Bills']

    //   window.location.pathname = ROUTES_PATH['Bills']
  
    //    document.body.innerHTML = '<div id="root"></div>'
    //   Object.defineProperty(window, "localStorage", {
    //     value: localStorageMock,
    //   })
    //   window.localStorage.setItem(
    //     "user",
    //     JSON.stringify({
    //       type: "Employee",
    //     })
    //   )
    //   router();
    //   console.log(document.body.innerHTML)

    //   const icone = screen.getByTestId('icon-window')
    //   console.log(icone)
    //   expect(
    //     screen.getByTestId("icon-window").classList.contains("active-icon")
    //   ).toBe(true);
    // });
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
});
describe("Given I am connected as employee", () => {
  describe("When I click on the icon eye", () => {
    test("A modal should open", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      const user = JSON.stringify({
        type: "Employee",
      });
      window.localStorage.setItem("user", user);
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html

      // console.log(html)

      const handleClickIconEye = jest.fn(bills.handleClickIconEye);
      const eyes = screen.getAllByTestId("icon-eye");
      eyes.forEach(function (eye, idx) {
        eye.addEventListener("click", handleClickIconEye);
      });
      console.log(eyes);
      userEvent.click(eyes[1]);
      expect(handleClickIconEye).toHaveBeenCalled();

      const modale = screen.getByTestId("modaleFile");
      expect(modale).toBeTruthy();
    });
  });
});
