const express = require("express");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());


// ===============================
// TEMPORARY DATABASE
// ===============================

let appointments = [];


// ===============================
// HOME / TEST
// ===============================

app.get("/", function (req, res) {

    res.json({
        message: "Hospital Queue Backend is Running"
    });

});


// ===============================
// BOOK APPOINTMENT
// ===============================

app.post("/appointments", function (req, res) {

    const {
        name,
        mobile,
        doctor,
        date
    } = req.body;


    // Check required fields

    if (!name || !mobile || !doctor || !date) {

        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });

    }


    // Generate token for selected date

    const dateAppointments =
        appointments.filter(function (patient) {

            return patient.date === date;

        });


    const token =
        dateAppointments.length + 1;


    // Queue position

    const waitingPatients =
        dateAppointments.filter(function (patient) {

            return patient.status === "Waiting";

        });


    const queuePosition =
        waitingPatients.length + 1;


    const waitingTime =
        (queuePosition - 1) * 10;


    const appointment = {

        id: Date.now(),

        name: name,

        mobile: mobile,

        doctor: doctor,

        date: date,

        token: token,

        queuePosition: queuePosition,

        waitingTime: waitingTime,

        status: "Waiting"

    };


    appointments.push(appointment);


    res.status(201).json({

        success: true,

        message: "Appointment booked successfully",

        appointment: appointment

    });

});


// ===============================
// GET ALL APPOINTMENTS
// ===============================

app.get("/appointments", function (req, res) {

    res.json({

        success: true,

        appointments: appointments

    });

});


// ===============================
// SEARCH APPOINTMENT
// MOBILE + DATE
// ===============================

app.get("/appointments/search", function (req, res) {

    const mobile =
        req.query.mobile;

    const date =
        req.query.date;


    if (!mobile || !date) {

        return res.status(400).json({

            success: false,

            message: "Mobile number and date are required"

        });

    }


    const patient =
        appointments.find(function (appointment) {

            return appointment.mobile === mobile &&
                   appointment.date === date;

        });


    if (!patient) {

        return res.status(404).json({

            success: false,

            message: "Appointment not found"

        });

    }


    // Recalculate queue position

    const waitingPatients =
        appointments.filter(function (appointment) {

            return appointment.date === date &&
                   appointment.status === "Waiting";

        });


    let position = "-";

    let waitingTime = "-";


    if (patient.status === "Waiting") {

        position =
            waitingPatients.findIndex(function (appointment) {

                return appointment.id === patient.id;

            }) + 1;


        waitingTime =
            (position - 1) * 10;

    }


    res.json({

        success: true,

        appointment: {

            ...patient,

            queuePosition: position,

            waitingTime: waitingTime

        }

    });

});


// ===============================
// CALL NEXT PATIENT
// ===============================

app.put("/appointments/call-next", function (req, res) {

    const today =
        new Date().toISOString().split("T")[0];


    const nextPatient =
        appointments.find(function (patient) {

            return patient.date === today &&
                   patient.status === "Waiting";

        });


    if (!nextPatient) {

        return res.status(404).json({

            success: false,

            message: "No waiting patient"

        });

    }


    nextPatient.status =
        "Called";


    res.json({

        success: true,

        message: "Patient called",

        appointment: nextPatient

    });

});


// ===============================
// COMPLETE PATIENT
// ===============================

app.put(
    "/appointments/:id/complete",
    function (req, res) {

        const id =
            Number(req.params.id);


        const patient =
            appointments.find(function (appointment) {

                return appointment.id === id;

            });


        if (!patient) {

            return res.status(404).json({

                success: false,

                message: "Patient not found"

            });

        }


        patient.status =
            "Completed";


        res.json({

            success: true,

            message: "Appointment completed",

            appointment: patient

        });

    }
);


// ===============================
// START SERVER
// ===============================

app.listen(PORT, function () {

    console.log(
        "Hospital Queue Backend running on port " + PORT
    );

});
