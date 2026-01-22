import { useEffect } from 'react';
import {
  FaChartLine,
  FaUsers,
  FaMapMarkerAlt,
  FaHeart
} from 'react-icons/fa';
import '../components/styles/Stats.css';

const Stats = () => {
  useEffect(() => {
    const counters = document.querySelectorAll('.stat-value');
    const speed = 200;

    counters.forEach(counter => {
      const animate = () => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;
        const increment = Math.ceil(target / speed);

        if (count < target) {
          counter.innerText = count + increment;
          setTimeout(animate, 20);
        } else {
          counter.innerText = target;
        }
      };
      animate();
    });
  }, []);

  return (
    <section className="stats-section">
      <h2 className="section-title">OUR IMPACT SO FAR</h2>
      <p className="section-subtitle">
        Real, measurable impact from communities actively using the Peace Building Hub
      </p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><FaChartLine /></div>
          <div className="stat-value" data-target="67">0</div>
          <div className="stat-label">% Reduction in Conflicts</div>
          <div className="stat-description">
            Communities using the platform report reduced conflict escalation
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><FaUsers /></div>
          <div className="stat-value" data-target="1200">0</div>
          <div className="stat-label">Active Users</div>
          <div className="stat-description">
            Citizens, peace actors, and organizations working together
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><FaMapMarkerAlt /></div>
          <div className="stat-value" data-target="15">0</div>
          <div className="stat-label">Counties Covered</div>
          <div className="stat-description">
            Growing reach across Kenya’s conflict-prone regions
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><FaHeart /></div>
          <div className="stat-value" data-target="3400">0</div>
          <div className="stat-label">Lives Impacted</div>
          <div className="stat-description">
            Direct impact through mediation, reporting, and support systems
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
