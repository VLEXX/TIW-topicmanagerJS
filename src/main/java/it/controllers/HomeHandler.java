package it.controllers;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;


@WebServlet(name = "HomeHandler", value = "/areapersonale/home")
@MultipartConfig
public class HomeHandler extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String homepage = "/WEB-INF/Home.html";
        RequestDispatcher dispatcher = getServletContext().getRequestDispatcher(homepage);
        dispatcher.forward(request, response);
    }

}
