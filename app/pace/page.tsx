"use client";

import { useState, CSSProperties } from "react";

/**
 * A faithful reproduction of the classic Cool Running pace calculator, long
 * mirrored by Greg Ovens at the University of Washington
 * (https://a.atmos.washington.edu/~ovens/racepace.html). The original is in the
 * public domain. The markup, colors, fonts, button labels, and the splits
 * popup all match the original; only the calculation internals were rewritten
 * (deriving every conversion from one meters-per-unit table) so the results
 * are correct, including the units the original mishandled.
 */

// Length of one of each unit, in meters — the single source of truth for every
// conversion. Reproduces the original's hard-coded factors exactly.
const METERS: Record<string, number> = {
  Mile: 1609.344,
  Kilometer: 1000,
  Meter: 1,
  Yard: 0.9144,
  "Half Mile": 804.672, // 880 yds
  "Quarter Mile": 402.336, // 440 yds
  "Eigth Mile": 201.168, // 220 yds
  "1500M": 1500,
  "800M": 800,
  "400M": 400,
  "200M": 200,
};

// How many `to` units fit in one `from` unit (e.g. Mile -> Kilometer = 1.609344)
const convUnit = (from: string, to: string) => METERS[from] / METERS[to];

const EVENTS: Record<string, { dist: string; unit: string }> = {
  Marathon: { dist: "26.21875", unit: "Mile" },
  "Half-Marathon": { dist: "13.109375", unit: "Mile" },
  "5K": { dist: "5", unit: "Kilometer" },
  "5M": { dist: "5", unit: "Mile" },
  "8K": { dist: "8", unit: "Kilometer" },
  "10K": { dist: "10", unit: "Kilometer" },
  "15K": { dist: "15", unit: "Kilometer" },
  "10M": { dist: "10", unit: "Mile" },
  "20K": { dist: "20", unit: "Kilometer" },
  "15M": { dist: "15", unit: "Mile" },
  "25K": { dist: "25", unit: "Kilometer" },
  "30K": { dist: "30", unit: "Kilometer" },
  "20M": { dist: "20", unit: "Mile" },
};

// Pace unit dropdown: [value, display label]. Labels match the original.
const PACE_UNITS: [string, string][] = [
  ["Mile", "Mile"],
  ["Kilometer", "Kilometer"],
  ["Half Mile", "880 yrds"],
  ["Quarter Mile", "440 yrds"],
  ["Eigth Mile", "220 yrds"],
  ["1500M", "1500 M"],
  ["800M", "800 M"],
  ["400M", "400 M"],
  ["200M", "200 M"],
  ["Meter", "Meter"],
  ["Yard", "Yard"],
];

// --- helpers ----------------------------------------------------------------

const isPosNum = (v: string) =>
  v.length > 0 && /^\d*\.?\d*$/.test(v) && (v.match(/\./g) ?? []).length <= 1;

const toSecs = (hr: string, min: string, sec: string) =>
  (parseFloat(hr || "0") || 0) * 3600 +
  (parseFloat(min || "0") || 0) * 60 +
  (parseFloat(sec || "0") || 0);

const pad2 = (n: number) => String(n).padStart(2, "0");

const fmtSec = (s: number) => {
  const r = Math.round(s * 100) / 100;
  const [i, f] = r.toString().split(".");
  return f ? `${i.padStart(2, "0")}.${f}` : i.padStart(2, "0");
};

const splitHMS = (total: number) => {
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total - hrs * 3600) / 60);
  const secs = total - hrs * 3600 - mins * 60;
  return { hrs, mins, secs };
};

const fmtNum = (n: number) => (Math.round(n * 10000) / 10000).toString();

const hms = (total: number) => {
  const { hrs, mins, secs } = splitHMS(total);
  return `${pad2(hrs)}:${pad2(mins)}:${fmtSec(secs)}`;
};

// --- styles (match the original page exactly) -------------------------------

const navyLabel: CSSProperties = {
  backgroundColor: "#000066",
  color: "#FFFFFF",
  fontWeight: "bold",
  verticalAlign: "top",
  textAlign: "right",
  padding: "4px",
};
const titleCell: CSSProperties = {
  backgroundColor: "#000066",
  color: "#FFFFFF",
  fontWeight: "bold",
  textAlign: "center",
  padding: "4px",
};
const lilac: CSSProperties = {
  backgroundColor: "#CCCCFF",
  verticalAlign: "top",
  textAlign: "center",
  padding: "4px",
};
const lilacInstr: CSSProperties = { ...lilac };
const pale: CSSProperties = {
  backgroundColor: "#EEEEFF",
  verticalAlign: "top",
  textAlign: "center",
  padding: "4px",
};
const small: CSSProperties = { textAlign: "center", fontSize: "small" };

export default function PaceCalculator() {
  // Time
  const [thr, setThr] = useState("");
  const [tmin, setTmin] = useState("");
  const [tsec, setTsec] = useState("");
  // Distance
  const [dist, setDist] = useState("");
  const [dunit, setDunit] = useState("Mile");
  const [event, setEvent] = useState("special");
  // Pace
  const [phr, setPhr] = useState("");
  const [pmin, setPmin] = useState("");
  const [psec, setPsec] = useState("");
  const [punit, setPunit] = useState("Mile");

  const getTime = (): number | null => {
    if (![thr, tmin, tsec].every((v) => v === "" || isPosNum(v))) return null;
    const t = toSecs(thr, tmin, tsec);
    return t === 0 ? null : t;
  };
  const getDist = (): number | null =>
    isPosNum(dist) ? parseFloat(dist) : null;
  const getPace = (): number | null => {
    if (![phr, pmin, psec].every((v) => v === "" || isPosNum(v))) return null;
    const p = toSecs(phr, pmin, psec);
    return p === 0 ? null : p;
  };

  // Time = Dist * Pace
  const calcTime = () => {
    const d = getDist();
    const p = getPace();
    if (d === null || p === null) {
      alert("To calculate Time, enter the Pace and Distance");
      return;
    }
    const { hrs, mins, secs } = splitHMS(d * p * convUnit(dunit, punit));
    setThr(pad2(hrs));
    setTmin(pad2(mins));
    setTsec(fmtSec(secs));
  };

  // Dist = Time / Pace
  const calcDist = () => {
    const t = getTime();
    const p = getPace();
    if (t === null || p === null) {
      alert("To calculate Dist, enter the Time and Pace");
      return;
    }
    setEvent("special");
    setDist(fmtNum(t / (p / convUnit(punit, dunit))));
  };

  // Pace = Time / Dist
  const calcPace = () => {
    const t = getTime();
    const d = getDist();
    if (t === null || d === null) {
      alert("To calculate Pace, enter the Time and Distance");
      return;
    }
    const { hrs, mins, secs } = splitHMS(t / d / convUnit(dunit, punit));
    setPhr(pad2(hrs));
    setPmin(pad2(mins));
    setPsec(fmtSec(secs));
  };

  // Splits = cumulative time at each whole pace-unit over the distance.
  // Opens a popup window, just like the original.
  const calcSplits = () => {
    const d = getDist();
    let p = getPace();
    const t = getTime();
    if (d === null || (p === null && t === null)) {
      alert(
        "To calculate Splits, enter the Pace and Distance or Time and Distance"
      );
      return;
    }
    if (p === null && t !== null) p = t / d / convUnit(dunit, punit);
    if (p === null) return;

    const pdisp = PACE_UNITS.find(([v]) => v === punit)?.[1] ?? punit;
    const total = d * convUnit(dunit, punit);
    const remain = total % 1;
    const nsplits = total - remain;

    let rows = "";
    let stime = 0;
    for (let split = 1; split <= nsplits; split++) {
      stime += p;
      rows += `<tr><td>${split}</td><td>${pdisp}</td><td>${hms(stime)}</td></tr>`;
    }
    if (nsplits !== total) {
      stime += remain * p;
      rows += `<tr><td>${fmtNum(total)}</td><td>${pdisp}</td><td>${hms(
        stime
      )}</td></tr>`;
    }

    const hgt = Math.max(nsplits * 34, 120);
    const swin = window.open("", "", `resizable,scrollbars,height=${hgt},width=250`);
    if (!swin) {
      alert("Please allow popups to view splits.");
      return;
    }
    swin.document.write(
      `<html><head><title>Splits</title></head><body>` +
        `<table cellspacing="2">` +
        `<tr bgcolor="#C6E2FF"><td colspan="2" align="left">Splits</td><td>Times</td></tr>` +
        rows +
        `</table></body></html>`
    );
    swin.document.close();
  };

  const reset = () => {
    setThr("");
    setTmin("");
    setTsec("");
    setDist("");
    setDunit("Mile");
    setEvent("special");
    setPhr("");
    setPmin("");
    setPsec("");
    setPunit("Mile");
  };

  const onEventChange = (value: string) => {
    setEvent(value);
    const preset = EVENTS[value];
    if (preset) {
      setDist(preset.dist);
      setDunit(preset.unit);
    }
  };

  return (
    <table
      width={750}
      border={0}
      cellSpacing={0}
      cellPadding={0}
      align="center"
    >
      <tbody>
        <tr>
          <td>
            <h1>Pace calculator</h1>
            <br />
            Calculate your running pace per mile, kilometer, or any distance
            with a copy of the Cool Running pace calculator (
            <a href="https://a.atmos.washington.edu/~ovens/racepace.html">
              original source
            </a>
            ).
            <form method="POST" onSubmit={(e) => e.preventDefault()}>
              <table
                cellSpacing={0}
                cellPadding={4}
                border={0}
                align="center"
                width={420}
              >
                <tbody>
                  {/* Title */}
                  <tr>
                    <td colSpan={3} style={titleCell}>
                      P&nbsp;A&nbsp;C&nbsp;E &nbsp; C&nbsp;A&nbsp;L&nbsp;C&nbsp;U&nbsp;L&nbsp;A&nbsp;T&nbsp;O&nbsp;R
                    </td>
                  </tr>

                  {/* Time */}
                  <tr>
                    <td style={navyLabel}>Time</td>
                    <td style={lilac}>
                      <table>
                        <tbody>
                          <tr>
                            <td style={small}>hours</td>
                            <td style={small}>mins</td>
                            <td style={small}>secs</td>
                          </tr>
                          <tr>
                            <td align="center">
                              <input
                                type="text"
                                size={2}
                                maxLength={2}
                                value={thr}
                                onChange={(e) => setThr(e.target.value)}
                              />
                            </td>
                            <td align="center">
                              <input
                                type="text"
                                size={2}
                                maxLength={2}
                                value={tmin}
                                onChange={(e) => setTmin(e.target.value)}
                              />
                            </td>
                            <td align="center">
                              <input
                                type="text"
                                size={5}
                                maxLength={6}
                                value={tsec}
                                onChange={(e) => setTsec(e.target.value)}
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td style={lilacInstr}>
                      To calculate your time, fill in your distance and pace
                      then click here:
                      <br />
                      <input
                        type="button"
                        value="Calculate Time"
                        onClick={calcTime}
                      />
                    </td>
                  </tr>

                  {/* Distance */}
                  <tr>
                    <td style={navyLabel}>Distance</td>
                    <td style={pale}>
                      <input
                        type="text"
                        size={7}
                        maxLength={8}
                        value={dist}
                        onChange={(e) => {
                          setDist(e.target.value);
                          setEvent("special");
                        }}
                      />{" "}
                      <select
                        value={dunit}
                        onChange={(e) => setDunit(e.target.value)}
                      >
                        <option value="Mile">Miles</option>
                        <option value="Kilometer">Kilometers</option>
                        <option value="Meter">Meters</option>
                        <option value="Yard">Yards</option>
                      </select>
                      <br />
                      or
                      <br />
                      <select
                        value={event}
                        onChange={(e) => onEventChange(e.target.value)}
                      >
                        <option value="special">Pick Event</option>
                        {Object.keys(EVENTS).map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={pale}>
                      To calculate your distance, fill in your time and pace
                      then click here:
                      <br />
                      <input
                        type="button"
                        value="Calculate Distance"
                        onClick={calcDist}
                      />
                    </td>
                  </tr>

                  {/* Pace */}
                  <tr>
                    <td style={navyLabel}>Pace</td>
                    <td style={lilac}>
                      <table>
                        <tbody>
                          <tr>
                            <td style={small}>hr</td>
                            <td colSpan={2} style={small}>
                              min&nbsp;&nbsp;sec
                            </td>
                          </tr>
                          <tr>
                            <td align="center">
                              <input
                                type="text"
                                size={2}
                                maxLength={2}
                                value={phr}
                                onChange={(e) => setPhr(e.target.value)}
                              />
                            </td>
                            <td colSpan={2} align="center">
                              <input
                                type="text"
                                size={2}
                                maxLength={2}
                                value={pmin}
                                onChange={(e) => setPmin(e.target.value)}
                              />{" "}
                              <input
                                type="text"
                                size={5}
                                maxLength={6}
                                value={psec}
                                onChange={(e) => setPsec(e.target.value)}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>Per</td>
                            <td>
                              <select
                                value={punit}
                                onChange={(e) => setPunit(e.target.value)}
                              >
                                {PACE_UNITS.map(([value, label]) => (
                                  <option key={value} value={value}>
                                    {label}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td style={lilacInstr}>
                      To calculate your pace, fill in your time and distance
                      then click here:
                      <br />
                      <input
                        type="button"
                        value="Calculate Pace"
                        onClick={calcPace}
                      />
                    </td>
                  </tr>

                  {/* Splits + Reset */}
                  <tr>
                    <td colSpan={3} align="center" style={{ padding: "4px" }}>
                      <input
                        type="button"
                        value="Calculate Splits"
                        onClick={calcSplits}
                      />{" "}
                      <input type="button" value="Reset" onClick={reset} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </form>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
