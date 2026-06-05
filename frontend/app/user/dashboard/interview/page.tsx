"use client";

import { useEffect, useRef, useState } from "react";
import {
  Award,
  Bot,
  Brain,
  Camera,
  CameraOff,
  CheckCircle2,
  Loader2,
  Mic,
  MicOff,
  Play,
  RotateCcw,
  Sparkles,
  StopCircle,
  Volume2,
  XCircle,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Mode = "setup" | "live" | "finished";

type Message = {
  role: "ai" | "user" | "feedback";
  content: string;
};

type FinalReport = {
  overall_score: number;
  communication_score: number;
  role_knowledge_score: number;
  confidence_score: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
};

type InterviewResponse = {
  status?: string;
  action?: "evaluate_answer" | "repeat_question" | "final_report";
  interview_id?: string;
  question?: string;
  next_question?: string;
  feedback?: string;
  score?: number | null;
  strengths?: string[];
  weaknesses?: string[];
  improved_answer?: string;
  is_answer_relevant?: boolean | null;
  final_report?: FinalReport;
  detail?: string;
  question_number?: number;
  total_questions?: number;
};

export default function InterviewPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  const [mode, setMode] = useState<Mode>("setup");
  const [interviewId, setInterviewId] = useState("");

  const [jobRole, setJobRole] = useState("");
  const [industryHint, setIndustryHint] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Entry Level");

  const [cameraOn, setCameraOn] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);

  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(10);

  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);
  const [latestFeedback, setLatestFeedback] =
    useState<InterviewResponse | null>(null);
  const [finalReport, setFinalReport] = useState<FinalReport | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    return () => {
      stopListening();
      stopCamera();
      window.speechSynthesis?.cancel();
    };
  }, []);

  function getToken() {
    return localStorage.getItem("token");
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;
      setCameraOn(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 150);
    } catch (error) {
      console.error("Camera error:", error);
      setNotice("Please allow camera and microphone access.");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOn(false);
  }

  function speak(text: string, afterSpeak?: () => void) {
    if (!("speechSynthesis" in window)) {
      afterSpeak?.();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.92;
    utterance.pitch = 1;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => {
      setSpeaking(false);
      afterSpeak?.();
    };

    window.speechSynthesis.speak(utterance);
  }

  function startListening() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setNotice("Voice recognition needs Google Chrome.");
      return;
    }

    stopListening();

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let text = "";

      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }

      setCurrentAnswer(text.trim());
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event);
      setListening(false);
      setNotice("Voice capture stopped. Press Answer Again and continue.");
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  function stopListening() {
    recognitionRef.current?.stop?.();
    recognitionRef.current = null;
    setListening(false);
  }

  async function startInterview() {
    if (!API_URL) {
      setNotice("Backend API URL is missing.");
      return;
    }

    if (!jobRole.trim()) {
      setNotice("Please enter the job role first.");
      return;
    }

    setNotice("");
    setLoading(true);
    setMode("live");
    setInterviewId("");
    setMessages([]);
    setLatestFeedback(null);
    setFinalReport(null);
    setCurrentAnswer("");
    setCurrentQuestion("");
    setQuestionNumber(1);
    setTotalQuestions(10);

    await startCamera();

    try {
      const token = getToken();

      const response = await fetch(`${API_URL}/interviews/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          job_role: jobRole.trim(),
          role: jobRole.trim(),
          industry_hint: industryHint.trim(),
          experience_level: experienceLevel,
          level: experienceLevel,
          total_questions: 10,
          instruction:
            "Start like a real interview. Welcome the candidate first, ask a simple opening question, then continue naturally.",
        }),
      });

      const data: InterviewResponse = await response.json();

      if (!response.ok) {
        console.error("Start interview backend error:", data);
        throw new Error("Interview start failed");
      }

      if (data.interview_id) {
        setInterviewId(data.interview_id);
      }

      if (data.total_questions) {
        setTotalQuestions(data.total_questions);
      }

      const firstQuestion =
        data.question ||
        `Hello, welcome to your ${jobRole.trim()} interview. How are you today?`;

      setCurrentQuestion(firstQuestion);
      setMessages([{ role: "ai", content: firstQuestion }]);

      speak(firstQuestion, () => startListening());
    } catch (error) {
      console.error("Start interview error:", error);
      setMode("setup");
      setNotice("Interview service is not ready right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer() {
    if (!API_URL) {
      setNotice("Backend API URL is missing.");
      return;
    }

    if (!currentAnswer.trim()) {
      setNotice("No voice answer detected. Please speak your answer first.");
      return;
    }

    stopListening();
    setLoading(true);
    setNotice("");

    const answer = currentAnswer.trim();

    setMessages((prev) => [...prev, { role: "user", content: answer }]);

    try {
      const token = getToken();

      const response = await fetch(`${API_URL}/interviews/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          interview_id: interviewId || null,
          job_role: jobRole.trim(),
          role: jobRole.trim(),
          industry_hint: industryHint.trim(),
          experience_level: experienceLevel,
          level: experienceLevel,
          question_number: questionNumber,
          total_questions: totalQuestions,
          question: currentQuestion,
          answer,
          conversation: messages,
          instruction:
            "Evaluate honestly like a real interviewer. If the answer is only greeting or irrelevant, do not mark it as good. If candidate asks to repeat, do not evaluate, repeat the same question.",
        }),
      });

      const data: InterviewResponse = await response.json();

      if (!response.ok) {
        console.error("Answer evaluation backend error:", data);
        throw new Error("Answer evaluation failed");
      }

      if (data.total_questions) {
        setTotalQuestions(data.total_questions);
      }

      setCurrentAnswer("");

      if (data.action === "repeat_question") {
        const repeatText =
          data.next_question ||
          data.question ||
          `No problem, let me repeat the question. ${currentQuestion}`;

        setLatestFeedback(null);
        setCurrentQuestion(currentQuestion);

        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content: repeatText,
          },
        ]);

        speak(repeatText, () => startListening());
        return;
      }

      setLatestFeedback(data);

      const feedbackText =
        data.feedback ||
        "I reviewed your answer. Try to give a clearer example with your exact contribution and result.";

      setMessages((prev) => [
        ...prev,
        { role: "feedback", content: feedbackText },
      ]);

      if (data.final_report || questionNumber >= totalQuestions) {
        const report =
          data.final_report ||
          ({
            overall_score: data.score || 60,
            communication_score: data.score || 60,
            role_knowledge_score: data.score || 60,
            confidence_score: data.score || 60,
            strengths: data.strengths || [],
            weaknesses: data.weaknesses || [],
            recommendation:
              "Practice more role-specific answers using clear examples and the STAR method.",
          } satisfies FinalReport);

        setFinalReport(report);
        setMode("finished");

        speak(
          `Interview completed. Your overall score is ${report.overall_score} out of 100. ${report.recommendation}`
        );

        return;
      }

      const nextQuestion =
        data.next_question ||
        data.question ||
        `Can you give me a practical example that proves your ability for the ${jobRole.trim()} role?`;

      setQuestionNumber((prev) => prev + 1);
      setCurrentQuestion(nextQuestion);

      setMessages((prev) => [...prev, { role: "ai", content: nextQuestion }]);

      speak(`${feedbackText}. Next question. ${nextQuestion}`, () =>
        startListening()
      );
    } catch (error) {
      console.error("GPT interview answer error:", error);
      setNotice("I couldn’t evaluate your answer right now. Please try again.");
      startListening();
    } finally {
      setLoading(false);
    }
  }

  function resetInterview() {
    stopListening();
    stopCamera();
    window.speechSynthesis?.cancel();

    setMode("setup");
    setInterviewId("");
    setMessages([]);
    setLatestFeedback(null);
    setFinalReport(null);
    setCurrentQuestion("");
    setCurrentAnswer("");
    setQuestionNumber(1);
    setTotalQuestions(10);
    setNotice("");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 p-6 text-white shadow-2xl shadow-blue-500/25 md:p-8">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15">
            <Brain className="h-7 w-7" />
          </div>

          <div>
            <p className="text-sm font-bold text-blue-100">
              Real GPT Voice Interview
            </p>
            <h1 className="text-3xl font-black md:text-4xl">
              AI Mock Interview
            </h1>
          </div>
        </div>

        <p className="mt-4 max-w-4xl text-sm leading-7 text-blue-100">
          Type any job role. GPT acts like a real interviewer, asks suitable
          questions, listens to your spoken answers, evaluates them seriously,
          and tells you exactly how to improve.
        </p>
      </section>

      {notice && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm font-bold text-amber-700">
          {notice}
        </div>
      )}

      {mode === "setup" && (
        <section className="grid gap-6 xl:grid-cols-[460px_1fr]">
          <div className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/50 md:p-6">
            <h2 className="text-2xl font-black text-slate-950">
              Setup Your Interview
            </h2>

            <label className="mt-5 block">
              <span className="text-sm font-black text-slate-800">
                Job role
              </span>
              <input
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                placeholder="Software Engineer, Accountant, Nurse, HR Executive..."
                className="mt-2 w-full rounded-2xl border border-blue-100 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-black text-slate-800">
                Industry hint optional
              </span>
              <input
                value={industryHint}
                onChange={(e) => setIndustryHint(e.target.value)}
                placeholder="IT, Healthcare, Finance, Hotel, Construction..."
                className="mt-2 w-full rounded-2xl border border-blue-100 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-black text-slate-800">
                Experience level
              </span>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-blue-100 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500"
              >
                <option>Internship</option>
                <option>Entry Level</option>
                <option>Junior</option>
                <option>Mid Level</option>
                <option>Senior</option>
                <option>Manager</option>
              </select>
            </label>

            <button
              onClick={startInterview}
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-4 text-sm font-black text-white shadow-xl shadow-blue-500/25 transition hover:-translate-y-1 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Starting Interview...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Start Interview
                </>
              )}
            </button>
          </div>

          <div className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-xl shadow-blue-100/50 md:p-8">
            <div className="grid min-h-[430px] place-items-center rounded-[2rem] bg-blue-50/70 text-center">
              <div>
                <Sparkles className="mx-auto h-16 w-16 text-blue-600" />
                <h2 className="mt-5 text-3xl font-black text-slate-950">
                  Speak-only real interview
                </h2>
                <p className="mx-auto mt-3 max-w-lg text-sm font-semibold leading-7 text-slate-500">
                  No typing answers. Camera and microphone open. GPT asks the
                  questions by voice and you answer by speaking.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {mode === "live" && (
        <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <aside className="space-y-5">
            <div className="overflow-hidden rounded-[2rem] border border-blue-100 bg-slate-950 shadow-xl">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`h-72 w-full scale-x-[-1] object-cover md:h-80 ${
                  cameraOn ? "block" : "hidden"
                }`}
              />

              {!cameraOn && (
                <div className="grid h-72 place-items-center text-white md:h-80">
                  <div className="text-center">
                    <CameraOff className="mx-auto h-12 w-12" />
                    <p className="mt-3 text-sm font-bold">Camera Off</p>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/50">
              <div className="grid grid-cols-2 gap-3">
                <StatusBox
                  active={cameraOn}
                  icon={cameraOn ? Camera : CameraOff}
                  label={cameraOn ? "Camera On" : "Camera Off"}
                />
                <StatusBox
                  active={listening}
                  icon={listening ? Mic : MicOff}
                  label={listening ? "Listening" : "Mic Off"}
                />
              </div>

              <button
                onClick={listening ? stopListening : startListening}
                className="mt-3 flex w-full items-center justify-center rounded-2xl bg-purple-50 px-4 py-3 text-sm font-black text-purple-700"
              >
                {listening ? (
                  <MicOff className="mr-2 h-5 w-5" />
                ) : (
                  <Mic className="mr-2 h-5 w-5" />
                )}
                {listening ? "Stop Listening" : "Answer Again"}
              </button>

              <button
                onClick={resetInterview}
                className="mt-3 flex w-full items-center justify-center rounded-2xl bg-red-600 px-4 py-3 text-sm font-black text-white"
              >
                <StopCircle className="mr-2 h-5 w-5" />
                End Interview
              </button>
            </div>

            <div className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/50">
              <h3 className="text-lg font-black text-slate-950">Progress</h3>
              <div className="mt-4 h-3 rounded-full bg-blue-100">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
                  style={{
                    width: `${Math.round(
                      (questionNumber / totalQuestions) * 100
                    )}%`,
                  }}
                />
              </div>
              <p className="mt-3 text-sm font-bold text-slate-500">
                Question {questionNumber} of {totalQuestions}
              </p>
            </div>
          </aside>

          <main className="rounded-[2rem] border border-blue-100 bg-white shadow-xl shadow-blue-100/50">
            <div className="flex flex-col gap-3 border-b border-blue-100 p-5 md:flex-row md:items-center md:justify-between md:p-6">
              <div>
                <p className="text-sm font-black text-blue-600">
                  GPT Interviewer
                </p>
                <h2 className="text-2xl font-black text-slate-950 md:text-3xl">
                  {jobRole}
                </h2>
                <p className="mt-1 text-sm font-bold text-slate-500">
                  {industryHint || "Any Industry"} • {experienceLevel}
                </p>
              </div>

              {speaking && (
                <div className="flex w-fit items-center rounded-full bg-green-50 px-4 py-2 text-sm font-black text-green-700">
                  <Volume2 className="mr-2 h-4 w-4" />
                  AI speaking
                </div>
              )}
            </div>

            <div className="space-y-5 p-5 md:p-6">
              <div className="rounded-[2rem] bg-slate-100 p-5 md:p-6">
                <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                  <Bot className="h-4 w-4" />
                  Interview Question
                </div>
                <h3 className="text-xl font-black leading-snug text-slate-950 md:text-2xl">
                  {currentQuestion}
                </h3>
              </div>

              <div className="rounded-[2rem] border border-blue-100 bg-blue-50 p-5 md:p-6">
                <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600">
                  <Mic className="h-4 w-4" />
                  Your Spoken Answer
                </div>
                <p className="min-h-32 whitespace-pre-wrap text-base font-bold leading-8 text-slate-800 md:text-lg">
                  {currentAnswer ||
                    "Speak now. Your voice answer will appear here automatically."}
                </p>
              </div>

              <button
                onClick={submitAnswer}
                disabled={loading || !currentAnswer.trim()}
                className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-4 text-sm font-black text-white shadow-xl shadow-blue-500/25 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    GPT Evaluating...
                  </>
                ) : (
                  "Submit Spoken Answer"
                )}
              </button>

              {latestFeedback && <FeedbackCard feedback={latestFeedback} />}

              <div className="max-h-80 space-y-3 overflow-y-auto rounded-[2rem] bg-slate-50 p-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`rounded-2xl p-4 text-sm font-semibold leading-6 ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : msg.role === "feedback"
                        ? "bg-yellow-50 text-yellow-800"
                        : "bg-white text-slate-700"
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
              </div>
            </div>
          </main>
        </section>
      )}

      {mode === "finished" && finalReport && (
        <section className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-xl shadow-blue-100/50 md:p-8">
          <div className="flex items-center gap-3">
            <Award className="h-10 w-10 text-blue-600" />
            <div>
              <p className="text-sm font-black text-blue-600">
                Final Interview Report
              </p>
              <h2 className="text-3xl font-black text-slate-950">
                Overall Score: {finalReport.overall_score}/100
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <ScoreCard
              label="Communication"
              value={finalReport.communication_score}
            />
            <ScoreCard
              label="Role Knowledge"
              value={finalReport.role_knowledge_score}
            />
            <ScoreCard label="Confidence" value={finalReport.confidence_score} />
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <ListCard title="Strengths" items={finalReport.strengths} positive />
            <ListCard title="Areas to Improve" items={finalReport.weaknesses} />
          </div>

          <div className="mt-6 rounded-2xl bg-blue-50 p-5 text-sm font-bold leading-7 text-blue-800">
            {finalReport.recommendation}
          </div>

          <button
            onClick={resetInterview}
            className="mt-6 inline-flex items-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Practice Again
          </button>
        </section>
      )}
    </div>
  );
}

function StatusBox({
  active,
  icon: Icon,
  label,
}: {
  active: boolean;
  icon: any;
  label: string;
}) {
  return (
    <div
      className={`rounded-2xl p-4 text-center text-sm font-black ${
        active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
      }`}
    >
      <Icon className="mx-auto mb-2 h-5 w-5" />
      {label}
    </div>
  );
}

function FeedbackCard({ feedback }: { feedback: InterviewResponse }) {
  return (
    <div className="rounded-[2rem] border border-yellow-100 bg-yellow-50 p-5 md:p-6">
      <h3 className="text-xl font-black text-slate-950">
        Interview Feedback: {feedback.score ?? 0}/100
      </h3>

      <p className="mt-3 text-sm font-bold leading-7 text-yellow-800">
        {feedback.feedback}
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ListCard title="Good Points" items={feedback.strengths || []} positive />
        <ListCard title="Improve These" items={feedback.weaknesses || []} />
      </div>

      {feedback.improved_answer && (
        <div className="mt-4 rounded-2xl bg-white p-4 text-sm font-semibold leading-7 text-slate-700">
          <p className="mb-2 font-black text-slate-950">
            Better Answer Example
          </p>
          {feedback.improved_answer}
        </div>
      )}
    </div>
  );
}

function ListCard({
  title,
  items,
  positive,
}: {
  title: string;
  items: string[];
  positive?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <h4 className="mb-3 text-sm font-black text-slate-950">{title}</h4>

      <div className="space-y-2">
        {items.length === 0 && (
          <p className="text-sm font-semibold text-slate-500">No data yet.</p>
        )}

        {items.map((item, index) => (
          <div
            key={index}
            className="flex gap-2 text-sm font-semibold text-slate-700"
          >
            {positive ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            )}
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-blue-50 p-5">
      <p className="text-sm font-black text-slate-600">{label}</p>
      <h3 className="mt-2 text-3xl font-black text-blue-600">{value}/100</h3>
    </div>
  );
}