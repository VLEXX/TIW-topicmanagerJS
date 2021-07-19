package it.controllers;

import com.google.gson.Gson;
import it.beans.TopicBean;
import it.dao.TopicDAO;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;

@WebServlet(name = "TreeSupplier", value = "/areapersonale/topics")
public class TreeSupplier extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            Connection c = DBConnectionSupplier.getConnection();
            TopicDAO td = new TopicDAO(c);
            ArrayList<TopicBean> roottopiclist = td.treeGenerator();
            c.close();
            Gson gson = new Gson();
            String ser_roottopiclist = gson.toJson(roottopiclist);
            System.out.println("TreeSupplier: l'albero serializato risulta essere: "+ser_roottopiclist);
            response.setContentType("application/json");
            response.getWriter().write(ser_roottopiclist);
            response.setStatus(HttpServletResponse.SC_OK);
        } catch (SQLException throwables) {
            throwables.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

}
