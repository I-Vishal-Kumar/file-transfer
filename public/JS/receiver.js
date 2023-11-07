function select(element) {
  return document.querySelector(element);
}
function selectAll(element) {
  return document.querySelectorAll(element);
}

let join_id = "";

const receive = (e) => {
  document.querySelector("#receive_popup").style.display = "grid";
};
receive();
let data = "not found";
window.addEventListener("load", () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  if (urlParams.has("id")) {
    let sender_id = urlParams.get("id");
    document.querySelector("#receiving_ID").value = sender_id;
    document.querySelector("#receiver_connect").click();
  }

  window.localStorage.getItem("mode") === "light"
    ? qr_code("#dedede")
    : qr_code("#33343b");
});

let file_type = {
  music: '<ion-icon name="musical-notes-outline"></ion-icon>',
  video: '<ion-icon name="videocam-outline"></ion-icon>',
  image: '<ion-icon name="image-outline"></ion-icon>',
  text: '<ion-icon name="document-text-outline"></ion-icon>',
  other: '<ion-icon name="document-outline"></ion-icon>',
};
const image_extensions = [
  "JPEG",
  "PNG",
  "PSD",
  "RAW",
  "JPG",
  "jpeg",
  "png",
  "raw",
  "jpg",
];
const video_extensions = [
  "MP4",
  "MOV",
  "AVI",
  "WMV",
  "AVCHD",
  "FLV",
  "webM",
  "FLV",
  "WMV",
  "mp4",
  "mov",
  "avi",
  "wmv",
  "avchd",
  "flv",
];
const music_extensions = [
  "MP3",
  "WAV",
  "AIFF",
  "FLAC",
  "M4A",
  "OGG",
  "WMA",
  "mp3",
  "wav",
  "aiff",
  "flac",
  "m4a",
  "oog",
];
const text_extensions = [
  "ORG",
  "DAT",
  "LOG",
  "TXT",
  "TEXT",
  "PAGES",
  "org",
  "dat",
  "log",
  "txt",
  "text",
  "pages",
  "pdf",
  "PDF",
];

const executables = [
  "EXE",
  "exe",
  "BAT",
  "bat",
  "COM",
  "com",
  "INF",
  "inf",
  "BIN",
  "bin",
  "CPL",
  "cpl",
  "INS",
  "ins",
  "MSC",
  "msc",
  "MSI",
  "msi",
  "PAF",
  "paf",
];

select("#send_btn").addEventListener("click", () => {
  window.location.href = window.location.origin + "/sender";
});

select("#receive_btn").addEventListener("click", () => {
  window.location.href = window.location.origin + "/receive";
});

select("#normal_popup_close_btn").addEventListener("click", () => {
  select("#popup_page_normal").style.left = "-100vw";
});

(function () {
  let sender_id;
  let transfer_start_time, transfer_end_time;
  let file_extension_type;
  let is_allowed_executables = false;
  let popup_tip = document.querySelector("#popup_tip");
  let popup_page = document.querySelector("#popup_page");
  let popup_sending_tip = select("#popup_sending_tip");
  let popup_sending_page = select("#popup_sending_page");

  const socket = io();

  document
    .querySelector("#receiver_connect")
    .addEventListener("click", function () {
      sender_id = document.querySelector("#receiving_ID").value;
      join_id = generate_id();
      socket.emit("receiver-join", {
        uid: join_id,
        sender_uid: sender_id,
      });
      set_connection(true);
      receive_cut_box();
      sending_files();
    });

  let fileshare = {};

  socket.on("fs-meta", function (metadata) {
    // here i have to check the file extension if its an executable file prompt user a warning;
    // and ask permission to keep the transfer going on or cancel;
    //  checking if its a executable file or not

    let regex = new RegExp("[^.]+$");

    if (metadata.filename) {
      file_extension_type = get_file_type(metadata.filename.match(regex));
      if (
        !is_allowed_executables &&
        executables.includes(metadata.filename.match(regex)[0])
      ) {
        popup_page.style.left = "0vw";
        popup_tip.innerText = "detected an executable , want to allow ??.";

        select("#allow_executables_btn").addEventListener("click", () => {
          // is_allowed_executables = true;
          fileshare.metadata = metadata;
          fileshare.transmitted = 0;
          fileshare.buffer = [];

          socket.emit("fs-start", {
            uid: sender_id,
          });

          // check the type of file and asssign the image value accordingly
          popup_page.style.left = "-100vw";
          transfer_start_time = Date.now();

          transfer_box(
            true,
            get_file_type(metadata.filename.match(regex)),
            metadata.filename
          );
        });

        select("#popup_close_btn").addEventListener("click", () => {
          popup_page.style.left = "-100vw";
          // disconnect the user;
        });
      } else {
        fileshare.metadata = metadata;
        fileshare.transmitted = 0;
        fileshare.buffer = [];

        socket.emit("fs-start", {
          uid: sender_id,
        });

        // check the type of file and asssign the image value accordingly
        transfer_start_time = Date.now();
        transfer_box(
          true,
          get_file_type(metadata.filename.match(regex)),
          metadata.filename
        );
      }
    }
  });

  socket.on("fs-share", function (buffer) {
    fileshare.buffer.push(buffer);
    fileshare.transmitted += buffer.byteLength;

    let progress =
      Math.trunc(
        (fileshare.transmitted / fileshare.metadata.total_buffer_size) * 100
      ) + "%";
    // every time progress changes update the completed status ;

    if (window.innerWidth > 800) {
      select(".completed_stick").style.width = progress;
    } else {
      select(
        ".mobile_complete_stick"
      ).style.backgroundImage = `conic-gradient(at ${progress} 100% , #fff , #158af6)`;
    }

    if (fileshare.transmitted === fileshare.metadata.total_buffer_size) {
      download(new Blob(fileshare.buffer), fileshare.metadata.filename);
      transfer_end_time = Date.now();
      let time_in_second = (transfer_end_time - transfer_start_time) / 1000;
      let minutes = Math.floor(time_in_second / 60);
      let seconds = (time_in_second % 60).toFixed(2);
      let size = (fileshare.metadata.total_buffer_size / 1000 / 1000).toFixed(
        2
      );
      let data = {
        file_name: fileshare.metadata.filename,
        time: `${minutes}:${seconds}`,
        type: file_extension_type,
        size: size,
      };

      let config = {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(data),
      };
      fetch("/transfer_data", config);
      fileshare = {};
      transfer_box(false);
    } else {
      socket.emit("fs-start", {
        uid: sender_id,
      });
    }
  });

  function download(blob, filename) {
    const objectUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.setAttribute("href", objectUrl);
    link.setAttribute("download", filename);
    link.style.display = "none";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  }

  //   ------------------------------ functions to send data from receiver side -------------------------------
  function sending_files() {
    select("#input_box > input").addEventListener("input", (e) => {
      let file = e.target.files[0];
      if (!file) {
        return;
      }

      //  checking if its a executable file or not

      let regex = new RegExp("[^.]+$");
      let extension = file.name.match(regex);
      let isExecutable = executables.includes(extension[0]);
      let reader, buffer;
      if (!isExecutable) {
        reader = new FileReader();
        reader.onload = function (e) {
          buffer = new Uint8Array(reader.result);
          shareFile(
            {
              filename: file.name,
              total_buffer_size: buffer.length,
              buffer_size: 3072,
            },
            buffer
          );
        };
        reader.readAsArrayBuffer(file);
      } else {
        popup_sending_page.style.left = "0vw";
        popup_sending_tip.innerText =
          "detected an executable , want to allow ??.";

        select("#allow_sending_executables_btn").addEventListener(
          "click",
          () => {
            reader = new FileReader();
            reader.onload = function (e) {
              buffer = new Uint8Array(reader.result);
              shareFile(
                {
                  filename: file.name,
                  total_buffer_size: buffer.length,
                  buffer_size: 3072,
                },
                buffer
              );
            };
            reader.readAsArrayBuffer(file);
          }
        );

        select("#cancel_executable_sending").addEventListener("click", () => {
          popup_sending_page.style.left = "-100vw";
          return;
        });
      }

      function shareFile(metadata, buffer) {
        socket.emit("initiating_receiver_send", {
          uid: sender_id,
          metadata: metadata,
        });

        //  here we have to create the shairing display box which will display the amount of data transfered;

        transfer_box(true, get_file_type(extension), metadata.filename);
        transfer_start_time = Date.now();
        socket.on("start_share", function () {
          let second_time = false;
          let chunk = buffer.slice(0, metadata.buffer_size);
          buffer = buffer.slice(metadata.buffer_size, buffer.length);
          let progress = Math.trunc(
            ((metadata.total_buffer_size - buffer.length) /
              metadata.total_buffer_size) *
              100
          );
          // every time progress is updated update the progress in transfer box;
          if (window.innerWidth > 800) {
            select(".completed_stick").style.width = progress;
          } else {
            select(
              ".mobile_complete_stick"
            ).style.backgroundImage = `conic-gradient(at ${progress}% 100% , #fff , #158af6)`;
          }

          if (progress !== 100) {
            socket.emit("raw_file_from_receiver", {
              uid: sender_id,
              buffer: chunk,
            });
          } else if (buffer.length === 0) {
            if (!second_time) {
              socket.emit("raw_file_from_receiver", {
                uid: sender_id,
                buffer: chunk,
              });
            }
            second_time = true;
            transfer_end_time = Date.now();
            let time_in_second =
              (transfer_end_time - transfer_start_time) / 1000;
            let minutes = Math.floor(time_in_second / 60);
            let seconds = (time_in_second % 60).toFixed(2);
            let size = (metadata.total_buffer_size / 1000 / 1000).toFixed(2);
            let data = {
              file_name: metadata.filename,
              time: `${minutes}:${seconds}`,
              type: extension[0],
              size: size,
            };

            let config = {
              method: "POST",
              headers: {
                "content-type": "application/json",
              },
              body: JSON.stringify(data),
            };
            fetch("/transfer_data", config);
            transfer_box(false);
          }
        });
      }
    });
  }
})();

function copy_id() {
  window.navigator.clipboard.writeText(join_id);
  select("#popup_page").style.left = "0vw";
  select("#popup_tip").innerText = "copied !!";
}

// function will toggle the connection status svg color ;
function set_connection(is_connected) {
  if (is_connected) {
    select(".qr_box").innerHTML = `
      <div  id="input_box">
      <input type="file" name="files"></input>
      </div>`;
  } else {
    select("#qrcode").innerHTML = `<div id="qrcode" onClick="copy_id">
    </div>`;
    receive();
    window.localStorage.getItem("mode") === "light"
      ? qr_code("#dedede")
      : qr_code("#33343b");
  }
  select("#connection_stat").style.fill = is_connected ? "#65D153" : "#ff3d3d";
}

function transfer_box(to_add, type, filename = "") {
  if (to_add) {
    let transfer_box = document.createElement("div");
    transfer_box.classList.add("receiving_box");

    let transfer_box_body = `
                       <div class="text_display">
                        <div class="file_type_logo">
                        ${file_type[type]}
                        </div>
                       <div class="file_description">
                       <h5>${filename.slice(0, 15)}..</h5>
                    </div>
                    </div>
                       <div class="cut_box" onClick="cancel_transfer()">
                    </div>
                       <div class="empty_box">
                       <div class="completed_box">
                       <p class="completed_stick"></p>
                    </div>
                 </div>
                 <div class="mobile_complete_stick"></div>
                 `;

    transfer_box.innerHTML = transfer_box_body;
    select("#home_body").appendChild(transfer_box);
  } else {
    // here we know the data transfer is completed so remove the transfer box;
    let box = document.querySelector(".receiving_box");
    box.style.animation = "remove 1.5s ease-in-out";
    box.remove();
  }
}

function cancel_transfer() {
  window.location.reload();
}

function generate_id() {
  return `${Math.trunc(Math.random() * 999)}-${Math.trunc(
    Math.random() * 999
  )}-${Math.trunc(Math.random() * 999)}`;
}
// function for qr code
function qr_code(color) {
  select("#qrcode").innerHTML = "";
  const qrCode = new QRCodeStyling({
    width: 100,
    height: 100,
    data: data,
    margin: 0,
    qrOptions: {
      typeNumber: "0",
      mode: "Byte",
      errorCorrectionLevel: "Q",
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.4,
      margin: 0,
    },
    dotsOptions: {
      type: "extra-rounded",
      color:
        window.localStorage.getItem("mode") === "light" ? "#222426" : "#77caf3",
    },
    backgroundOptions: {
      color: color,
    },
    // "image":"../../PHOTOS/LOGO.png",
    dotsOptionsHelper: {
      colorType: {
        single: true,
        gradient: false,
      },
      gradient: {
        linear: true,
        radial: false,
        color1: "#6a1a4c",
        color2: "#6a1a4c",
        rotation: "0",
      },
    },
    cornersSquareOptions: {
      type: "extra-rounded",
      color: "#5351a9",
    },
    cornersSquareOptionsHelper: {
      colorType: {
        single: true,
        gradient: false,
      },
      gradient: {
        linear: true,
        radial: false,
        color1: "#000000",
        color2: "#000000",
        rotation: "0",
      },
    },
    cornersDotOptions: {
      type: "",
      color: "#8571bc",
    },
    cornersDotOptionsHelper: {
      colorType: {
        single: true,
        gradient: false,
      },
      gradient: {
        linear: true,
        radial: false,
        color1: "#000000",
        color2: "#000000",
        rotation: "0",
      },
    },
    backgroundOptionsHelper: {
      colorType: {
        single: true,
        gradient: false,
      },
      gradient: {
        linear: true,
        radial: false,
        color1: "#ffffff",
        color2: "#ffffff",
        rotation: "0",
      },
    },
  });

  qrCode.append(document.querySelector("#qrcode"));
}

// function will return the file extension type ;

function get_file_type(extension) {
  let ext = extension[0];
  if (music_extensions.includes(ext)) {
    return "music";
  } else if (video_extensions.includes(ext)) {
    return "video";
  } else if (image_extensions.includes(ext)) {
    return "image";
  } else if (text_extensions.includes(ext)) {
    return "text";
  }
  return "other";
}

function receive_cut_box(e) {
  select("#receive_popup").style.display = "none";
}

// function for toggling dark and light mode

(function () {
  let current_mode = window.localStorage.getItem("mode");
  if (current_mode === "light") {
    select("#sun > svg").classList.add("light_mode_sun");
    select("#moon > svg").classList.add("light_mode_moon");
    select("html").setAttribute("data-theme", "light_mode");
  } else {
    select("#sun > svg").classList.add("dark_mode_sun");
    select("#moon > svg").classList.add("dark_mode_moon");
    select("html").setAttribute("data-theme", "dark_mode");
  }
  select("#d_l_mode_toggle_box").addEventListener("click", () => {
    if (typeof window.localStorage.getItem("mode") !== "undefined") {
      if (window.localStorage.getItem("mode") === "light") {
        window.localStorage.setItem("mode", "dark");
        select("#sun > svg").classList.add("dark_mode_sun");
        select("#moon > svg").classList.add("dark_mode_moon");
        select("#moon > svg").classList.remove("light_mode_moon");
        select("#sun > svg").classList.remove("light_mode_sun");
        select("html").setAttribute("data-theme", "dark_mode");
        qr_code("#33343b");
      } else {
        window.localStorage.setItem("mode", "light");
        select("#moon > svg").classList.add("light_mode_moon");
        select("#sun > svg").classList.add("light_mode_sun");
        select("#sun > svg").classList.remove("dark_mode_sun");
        select("#moon > svg").classList.remove("dark_mode_moon");
        select("html").setAttribute("data-theme", "light_mode");

        qr_code("#dedede");
      }
    } else {
      localStorage.setItem("mode", "light");
      select("html").setAttribute("data-theme", "light_mode");
      qr_code("#33343b");
    }
  });
})();
